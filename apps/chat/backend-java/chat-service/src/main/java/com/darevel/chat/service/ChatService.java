package com.darevel.chat.service;

import com.darevel.common.dto.UserDto;
import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.model.Message;
import com.darevel.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${auth.service.url:http://localhost:8081}")
    private String authServiceUrl;

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
        message.setContent(request.getContent());
        message.setIsRead(false);

        message = messageRepository.save(message);

        MessageDto messageDto = enrichMessageWithUserInfo(message);

        // Broadcast message to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/messages/" + channelId, messageDto);
        log.info("Broadcasted message to /topic/messages/{}", channelId);

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
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsRead(message.getIsRead());

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
