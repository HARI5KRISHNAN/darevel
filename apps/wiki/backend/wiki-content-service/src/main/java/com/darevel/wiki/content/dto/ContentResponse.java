package com.darevel.wiki.content.dto;

import com.darevel.wiki.content.domain.Block;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response containing page content
 */
public record ContentResponse(
    UUID pageId,
    List<Block> blocks,
    Long version,
    Instant updatedAt,
    UUID updatedBy,
    Instant createdAt,
    UUID createdBy
) {
}
