package com.darevel.chat.dto;

import java.time.LocalDateTime;

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

    public MessageDto() {
    }

    public MessageDto(Long id, String channelId, Long userId, String content, LocalDateTime timestamp, Boolean isRead, String userName, String userEmail, String userAvatar) {
        this.id = id;
        this.channelId = channelId;
        this.userId = userId;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getChannelId() {
        return channelId;
    }

    public void setChannelId(String channelId) {
        this.channelId = channelId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }
}
