package com.darevel.chat.service;

import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.model.Message;
import com.darevel.chat.repository.MessageRepository;
import com.darevel.chat.security.AttachmentEncryptionService;
import com.darevel.chat.security.CryptoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AttachmentEncryptionService attachmentEncryptionService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth.service.url:http://localhost:8081}")
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
                // In production, replace with proper KMS integration
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

        // Note: Do not broadcast if using WebSocketController - it handles broadcasting
        // This method is called from WebSocketController which does the broadcast
        MessageDto messageDto = enrichMessageWithUserInfo(message);

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
