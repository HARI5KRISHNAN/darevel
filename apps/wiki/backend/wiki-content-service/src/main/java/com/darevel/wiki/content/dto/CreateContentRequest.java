package com.darevel.wiki.content.dto;

import com.darevel.wiki.content.domain.Block;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request to create initial content for a page
 */
public record CreateContentRequest(
    @NotNull(message = "Page ID is required")
    UUID pageId,

    List<Block> blocks,

    @NotNull(message = "Creator user ID is required")
    UUID createdBy
) {
}
