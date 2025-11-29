package com.darevel.wiki.content.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an editing lock on page content
 * Prevents concurrent editing conflicts
 */
@Entity
@Table(name = "content_lock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentLock {

    @Id
    @Column(name = "page_id")
    private UUID pageId;

    @Column(name = "locked_by", nullable = false)
    private UUID lockedBy;

    @Column(name = "locked_at", nullable = false)
    private Instant lockedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    /**
     * Check if the lock has expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    /**
     * Check if the lock belongs to a specific user and session
     */
    public boolean belongsTo(UUID userId, String sessionId) {
        return this.lockedBy.equals(userId) && this.sessionId.equals(sessionId);
    }
}
