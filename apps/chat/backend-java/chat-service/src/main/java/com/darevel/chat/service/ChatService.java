package com.darevel.chat.service;

import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.model.Message;
import com.darevel.chat.repository.MessageRepository;
import com.darevel.chat.security.AttachmentEncryptionService;
import com.darevel.chat.security.CryptoUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.ArrayList;

/**
 * ChatService: persists messages, handles optional server-side encryption,
 * enriches messages with user info and broadcasts saved messages to subscribers.
 *
 * Note: WebSocketController should NOT also broadcast the same message after calling this method,
 * to avoid duplicate pushes. Either side may broadcast, but only once.
 */
@Service
public class ChatService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ChatService.class);

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AttachmentEncryptionService attachmentEncryptionService;
    private final RestTemplate restTemplate = new RestTemplate();

    // Cache for group member IDs (channelId -> List<userId>)
    private final Map<String, List<Long>> groupMembersCache = new ConcurrentHashMap<>();

    public ChatService(MessageRepository messageRepository, SimpMessagingTemplate messagingTemplate, AttachmentEncryptionService attachmentEncryptionService) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.attachmentEncryptionService = attachmentEncryptionService;
    }

    @Value("${auth.service.url:http://localhost:8086}")
    private String authServiceUrl;

    @Value("${chat.encryption.enabled:false}")
    private boolean encryptionEnabled;

    public List<MessageDto> getMessages(String channelId) {
        List<Message> messages = messageRepository.findByChannelIdOrderByTimestampAsc(channelId);

        return messages.stream()
                .map(this::enrichMessageWithUserInfo)
                .collect(Collectors.toList());
    }

    public List<String> getUserChannels(Long userId) {
        return messageRepository.findDistinctChannelIdsByUserId(userId);
    }

    /**
     * Persist message, optionally encrypt, then broadcast to subscribers.
     * Returns the DTO (plaintext if server-side decryption is configured).
     */
    @Transactional
    public MessageDto sendMessage(String channelId, SendMessageRequest request) {
        Message message = new Message();
        message.setChannelId(channelId);
        message.setUserId(request.getUserId());
        message.setIsRead(false);

        // Optional server-side encryption (disabled by default, prefer E2EE)
        if (encryptionEnabled) {
            try {
                log.debug("Server-side encryption enabled, encrypting message content");
                String plaintext = request.getContent();

                // Generate AES key for this message
                SecretKey msgKey = CryptoUtil.generateAesKey();
                CryptoUtil.EncryptedResult enc = CryptoUtil.encryptAesGcm(
                    plaintext.getBytes(StandardCharsets.UTF_8), msgKey);

                // Wrap msgKey with KMS (uses AttachmentEncryptionService's KMS client)
                // IMPORTANT: currently a placeholder. Replace with real KMS wrap in production.
                byte[] wrappedKey = msgKey.getEncoded(); // Placeholder - use KMS in production

                // Store ciphertext and encryption metadata
                message.setContent(CryptoUtil.base64(enc.getCipherText()));
                message.setEncryptionIv(CryptoUtil.base64(enc.getIv()));
                message.setWrappedMessageKey(Base64.getEncoder().encodeToString(wrappedKey));
                message.setIsEncrypted(true);

                log.debug("Message encrypted successfully for channel: {}", channelId);
            } catch (Exception e) {
                log.error("Failed to encrypt message, storing plaintext", e);
                message.setContent(request.getContent());
                message.setIsEncrypted(false);
            }
        } else {
            // Store plaintext (default behavior, or client sends E2EE ciphertext)
            message.setContent(request.getContent());
            message.setIsEncrypted(false);
        }

        message = messageRepository.save(message);

        // If this is a group creation message, extract and cache member IDs
        if (channelId.startsWith("group-") && request.getContent().contains("[IDS:")) {
            try {
                Pattern pattern = Pattern.compile("\\[IDS:([0-9,]+)\\]");
                Matcher matcher = pattern.matcher(request.getContent());
                if (matcher.find()) {
                    String idsStr = matcher.group(1);
                    List<Long> memberIds = Arrays.stream(idsStr.split(","))
                        .map(String::trim)
                        .map(Long::parseLong)
                        .collect(Collectors.toList());
                    groupMembersCache.put(channelId, memberIds);
                    log.info("📋 Cached {} member IDs for group {}", memberIds.size(), channelId);
                }
            } catch (Exception e) {
                log.warn("Failed to parse member IDs from group creation message", e);
            }
        }

        // Build DTO to broadcast
        MessageDto messageDto = enrichMessageWithUserInfo(message);

        // Broadcast to subscribers of the channel so both REST and non-WS senders push messages
        try {
            String destination = "/topic/messages/" + channelId;
            messagingTemplate.convertAndSend(destination, messageDto);
            log.info("💬 Broadcasted (from ChatService) message {} to {}", message.getId(), destination);
            
            // For direct messages, also broadcast to per-user topics so recipients get instant notifications
            if (channelId.startsWith("dm-")) {
                try {
                    // Extract user IDs from dm-{userId1}-{userId2} format
                    String[] parts = channelId.split("-");
                    if (parts.length == 3) {
                        Long userId1 = Long.parseLong(parts[1]);
                        Long userId2 = Long.parseLong(parts[2]);
                        
                        // Broadcast to both users' personal topics
                        String userTopic1 = "/topic/messages/user-" + userId1;
                        String userTopic2 = "/topic/messages/user-" + userId2;
                        
                        messagingTemplate.convertAndSend(userTopic1, messageDto);
                        messagingTemplate.convertAndSend(userTopic2, messageDto);
                        
                        log.info("💬 Broadcasted DM to personal topics: {} and {}", userTopic1, userTopic2);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse DM channel ID or broadcast to personal topics: {}", channelId, e);
                }
            }
            // For group messages, also broadcast to all known users who have messages in this channel
            else if (channelId.startsWith("group-")) {
                try {
                    List<Long> groupUserIds;

                    // First try to get from cache
                    if (groupMembersCache.containsKey(channelId)) {
                        groupUserIds = groupMembersCache.get(channelId);
                        log.debug("Using cached member IDs for group {}", channelId);
                    } else {
                        // Try to find the group creation message and extract member IDs
                        groupUserIds = findGroupMembersFromCreationMessage(channelId);

                        if (groupUserIds.isEmpty()) {
                            // Fall back to finding users who have sent messages
                            groupUserIds = messageRepository.findDistinctUserIdsByChannelId(channelId);
                            log.debug("Using database query for group {} members", channelId);
                        } else {
                            // Cache the member IDs for future use
                            groupMembersCache.put(channelId, groupUserIds);
                            log.info("📋 Restored and cached {} member IDs for group {}", groupUserIds.size(), channelId);
                        }
                    }

                    for (Long userId : groupUserIds) {
                        String userTopic = "/topic/messages/user-" + userId;
                        messagingTemplate.convertAndSend(userTopic, messageDto);
                    }

                    log.info("💬 Broadcasted group message to {} members' personal topics", groupUserIds.size());
                } catch (Exception e) {
                    log.warn("Failed to broadcast group message to personal topics: {}", channelId, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to broadcast message {} to topic {}: {}", message.getId(), channelId, e.getMessage());
        }

        return messageDto;
    }

    @Transactional
    public void clearAllMessages() {
        messageRepository.deleteAll();
    }

    @Transactional
    public void clearChannelMessages(String channelId) {
        messageRepository.deleteByChannelId(channelId);
    }

    /**
     * Find group members by looking for the creation message with [IDS:...] pattern
     */
    private List<Long> findGroupMembersFromCreationMessage(String channelId) {
        List<Long> memberIds = new ArrayList<>();
        try {
            // Get all messages for this channel to find the creation message
            List<Message> messages = messageRepository.findByChannelIdOrderByTimestampAsc(channelId);
            for (Message msg : messages) {
                if (msg.getContent() != null && msg.getContent().contains("[IDS:")) {
                    Pattern pattern = Pattern.compile("\\[IDS:([0-9,]+)\\]");
                    Matcher matcher = pattern.matcher(msg.getContent());
                    if (matcher.find()) {
                        String idsStr = matcher.group(1);
                        memberIds = Arrays.stream(idsStr.split(","))
                            .map(String::trim)
                            .map(Long::parseLong)
                            .collect(Collectors.toList());
                        log.info("📋 Found {} member IDs from creation message in group {}", memberIds.size(), channelId);
                        break; // Found the creation message, no need to continue
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to find group members from creation message for channel {}", channelId, e);
        }
        return memberIds;
    }

    private MessageDto enrichMessageWithUserInfo(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setChannelId(message.getChannelId());
        dto.setUserId(message.getUserId());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.getIsRead());

        // Decrypt content if server-side encrypted
        if (message.getIsEncrypted() != null && message.getIsEncrypted()) {
            try {
                log.debug("Decrypting message {} for delivery", message.getId());
                // In production, unwrap key from KMS first
                byte[] wrappedKey = Base64.getDecoder().decode(message.getWrappedMessageKey());
                SecretKey msgKey = CryptoUtil.secretKeyFromBytes(wrappedKey); // Use KMS unwrap in prod

                CryptoUtil.EncryptedResult encrypted = new CryptoUtil.EncryptedResult(
                    CryptoUtil.fromBase64(message.getEncryptionIv()),
                    CryptoUtil.fromBase64(message.getContent())
                );

                byte[] plaintext = CryptoUtil.decryptAesGcm(encrypted, msgKey);
                dto.setContent(new String(plaintext, StandardCharsets.UTF_8));
            } catch (Exception e) {
                log.error("Failed to decrypt message {}", message.getId(), e);
                dto.setContent("[Encrypted - Decryption Failed]");
            }
        } else {
            // Plaintext or E2EE ciphertext (passed through as-is)
            dto.setContent(message.getContent());
        }

        // Fetch user details from Auth Service
        try {
            String url = authServiceUrl + "/api/auth/users/" + message.getUserId();
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("data")) {
                Map<String, Object> userData = (Map<String, Object>) response.get("data");
                dto.setUserName((String) userData.get("name"));
                dto.setUserEmail((String) userData.get("email"));
                dto.setUserAvatar((String) userData.get("avatar"));
            }
        } catch (Exception e) {
            log.error("Failed to fetch user details for userId: " + message.getUserId(), e);
            dto.setUserName("Unknown User");
            dto.setUserEmail("");
            dto.setUserAvatar("");
        }

        return dto;
    }
}
