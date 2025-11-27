package com.darevel.chat.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "channel_id", nullable = false)
    private String channelId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private Boolean isRead = false;

    // Encryption fields (optional - for server-side encryption)
    @Column(name = "encryption_iv")
    private String encryptionIv;

    @Column(name = "wrapped_message_key")
    private String wrappedMessageKey;

    @Column(name = "is_encrypted")
    private Boolean isEncrypted = false;

    // Transient fields for user information (fetched from auth service)
    @Transient
    private String userName;

    @Transient
    private String userEmail;

    @Transient
    private String userAvatar;

    public Message() {
    }

    public Message(Long id, String channelId, Long userId, String content, LocalDateTime timestamp, Boolean isRead, String encryptionIv, String wrappedMessageKey, Boolean isEncrypted, String userName, String userEmail, String userAvatar) {
        this.id = id;
        this.channelId = channelId;
        this.userId = userId;
        this.content = content;
        this.timestamp = timestamp;
        this.isRead = isRead;
        this.encryptionIv = encryptionIv;
        this.wrappedMessageKey = wrappedMessageKey;
        this.isEncrypted = isEncrypted;
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

    public String getEncryptionIv() {
        return encryptionIv;
    }

    public void setEncryptionIv(String encryptionIv) {
        this.encryptionIv = encryptionIv;
    }

    public String getWrappedMessageKey() {
        return wrappedMessageKey;
    }

    public void setWrappedMessageKey(String wrappedMessageKey) {
        this.wrappedMessageKey = wrappedMessageKey;
    }

    public Boolean getIsEncrypted() {
        return isEncrypted;
    }

    public void setIsEncrypted(Boolean isEncrypted) {
        this.isEncrypted = isEncrypted;
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
