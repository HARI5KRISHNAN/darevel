package com.darevel.workflow.connections.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workflow_connections")
@Getter
@Setter
public class ConnectionSecretEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "encrypted_secret", columnDefinition = "text")
    private String encryptedSecret;

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
