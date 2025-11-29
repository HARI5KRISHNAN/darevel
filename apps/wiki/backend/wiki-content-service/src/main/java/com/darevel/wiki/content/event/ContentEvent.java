package com.darevel.wiki.content.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Base event for content changes
 */
public record ContentEvent(
    String eventType,
    UUID pageId,
    UUID userId,
    Long version,
    Instant timestamp,
    String summary
) {
    public static ContentEvent contentUpdated(UUID pageId, UUID userId, Long version, String summary) {
        return new ContentEvent("CONTENT_UPDATED", pageId, userId, version, Instant.now(), summary);
    }

    public static ContentEvent contentCreated(UUID pageId, UUID userId) {
        return new ContentEvent("CONTENT_CREATED", pageId, userId, 1L, Instant.now(), "Initial content created");
    }

    public static ContentEvent blockAdded(UUID pageId, UUID userId, Long version) {
        return new ContentEvent("BLOCK_ADDED", pageId, userId, version, Instant.now(), "Block added");
    }

    public static ContentEvent blockDeleted(UUID pageId, UUID userId, Long version) {
        return new ContentEvent("BLOCK_DELETED", pageId, userId, version, Instant.now(), "Block deleted");
    }

    public static ContentEvent commentAdded(UUID pageId, UUID userId) {
        return new ContentEvent("COMMENT_ADDED", pageId, userId, null, Instant.now(), "Comment added");
    }
}
