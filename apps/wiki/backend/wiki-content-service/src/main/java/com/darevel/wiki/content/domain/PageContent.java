package com.darevel.wiki.content.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing page content with block-based structure
 * Uses JSONB for flexible block storage
 */
@Entity
@Table(name = "page_content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageContent {

    @Id
    @Column(name = "page_id")
    private UUID pageId;

    /**
     * Block-based content stored as JSONB
     * Allows flexible schema for different block types
     */
    @Type(JsonBinaryType.class)
    @Column(name = "blocks", columnDefinition = "jsonb")
    @Builder.Default
    private List<Block> blocks = new ArrayList<>();

    /**
     * Version number for optimistic locking
     * Prevents concurrent edit conflicts
     */
    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "updated_by", nullable = false)
    private UUID updatedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
