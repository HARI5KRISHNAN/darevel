package com.darevel.spreadsheet.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "sheets")
@EntityListeners(AuditingEntityListener.class)
public class Sheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(name = "owner_id")
    private String ownerId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String data;

    @Column(columnDefinition = "TEXT")
    private String merges;

    @Column(name = "last_saved_at")
    private LocalDateTime lastSavedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "share_token")
    private String shareToken;

    // Constructors
    public Sheet() {
    }

    public Sheet(Long id, String name, String ownerId, String data, String merges, LocalDateTime lastSavedAt, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean isPublic, String shareToken) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.data = data;
        this.merges = merges;
        this.lastSavedAt = lastSavedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isPublic = isPublic;
        this.shareToken = shareToken;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getMerges() {
        return merges;
    }

    public void setMerges(String merges) {
        this.merges = merges;
    }

    public LocalDateTime getLastSavedAt() {
        return lastSavedAt;
    }

    public void setLastSavedAt(LocalDateTime lastSavedAt) {
        this.lastSavedAt = lastSavedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }
}
