package com.darevel.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String content;
    private String messageType;
    private String attachmentUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
