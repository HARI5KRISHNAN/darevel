package com.darevel.chat.service;

import com.darevel.chat.dto.MessageDTO;
import com.darevel.chat.entity.Message;
import com.darevel.chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;

    @Transactional
    public MessageDTO sendMessage(Jwt jwt, MessageDTO messageDTO) {
        String senderId = jwt.getSubject();
        String senderName = jwt.getClaim("name");

        Message message = Message.builder()
                .senderId(senderId)
                .senderName(senderName)
                .receiverId(messageDTO.getReceiverId())
                .content(messageDTO.getContent())
                .messageType(messageDTO.getMessageType())
                .attachmentUrl(messageDTO.getAttachmentUrl())
                .build();

        message = messageRepository.save(message);
        return mapToDTO(message);
    }

    @Transactional(readOnly = true)
    public Page<MessageDTO> getConversation(Jwt jwt, String otherUserId, int page, int size) {
        String userId = jwt.getSubject();
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findConversation(userId, otherUserId, pageable);
        return messages.map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Jwt jwt) {
        String userId = jwt.getSubject();
        return messageRepository.countUnreadByReceiverId(userId);
    }

    private MessageDTO mapToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(message.getSenderName())
                .receiverId(message.getReceiverId())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .attachmentUrl(message.getAttachmentUrl())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
