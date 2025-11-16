package com.darevel.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String channelId;
    private Long userId;
    private String content;
    private LocalDateTime timestamp;
    private Boolean isRead;
    private String userName;
    private String userEmail;
    private String userAvatar;
}
