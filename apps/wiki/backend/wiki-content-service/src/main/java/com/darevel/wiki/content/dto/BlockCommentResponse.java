package com.darevel.wiki.content.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response containing block comment details
 */
public record BlockCommentResponse(
    UUID id,
    UUID pageId,
    String blockId,
    UUID parentId,
    String content,
    UUID createdBy,
    Instant createdAt,
    Instant updatedAt,
    Instant resolvedAt,
    UUID resolvedBy,
    List<UUID> mentions,
    List<BlockCommentResponse> replies
) {
}
