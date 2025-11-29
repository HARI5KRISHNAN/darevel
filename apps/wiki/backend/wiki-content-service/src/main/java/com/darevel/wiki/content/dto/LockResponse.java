package com.darevel.wiki.content.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response containing lock information
 */
public record LockResponse(
    UUID pageId,
    UUID lockedBy,
    Instant lockedAt,
    Instant expiresAt,
    String sessionId,
    boolean isLocked
) {
}
