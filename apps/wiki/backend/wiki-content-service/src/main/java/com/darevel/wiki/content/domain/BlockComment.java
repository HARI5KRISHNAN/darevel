package com.darevel.wiki.content.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing inline comments on content blocks
 * Supports threading via parentId
 */
@Entity
@Table(name = "block_comment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(name = "block_id", nullable = false)
    private String blockId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    /**
     * Check if this is a top-level comment (not a reply)
     */
    public boolean isTopLevel() {
        return parentId == null;
    }

    /**
     * Check if the comment is resolved
     */
    public boolean isResolved() {
        return resolvedAt != null;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
