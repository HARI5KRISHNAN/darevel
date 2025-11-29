package com.darevel.drive.meta.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "drive_share_link", indexes = {
    @Index(name = "idx_drive_share_link_node", columnList = "node_id"),
    @Index(name = "idx_drive_share_link_token", columnList = "share_token", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriveShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @Column(name = "share_token", nullable = false, unique = true, length = 64)
    private String shareToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", nullable = false, length = 32)
    private PermissionLevel permissionLevel;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "download_count")
    private Long downloadCount;

    @Column(name = "max_downloads")
    private Long maxDownloads;
}
