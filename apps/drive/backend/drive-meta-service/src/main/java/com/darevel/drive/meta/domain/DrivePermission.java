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
@Table(name = "drive_permission", indexes = {
    @Index(name = "idx_drive_permission_node", columnList = "node_id"),
    @Index(name = "idx_drive_permission_user", columnList = "user_id"),
    @Index(name = "idx_drive_permission_node_user", columnList = "node_id,user_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrivePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "permission_level", nullable = false, length = 32)
    private PermissionLevel permissionLevel;

    @Column(name = "granted_by", nullable = false)
    private UUID grantedBy;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
