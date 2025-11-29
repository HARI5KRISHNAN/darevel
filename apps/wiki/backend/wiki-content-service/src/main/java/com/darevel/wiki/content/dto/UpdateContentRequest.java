package com.darevel.wiki.content.dto;

import com.darevel.wiki.content.domain.Block;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request to update page content (full replacement)
 * Includes version for optimistic locking
 */
public record UpdateContentRequest(
    @NotNull(message = "Blocks are required")
    List<Block> blocks,

    @NotNull(message = "Expected version is required for optimistic locking")
    Long expectedVersion,

    @NotNull(message = "User ID is required")
    UUID updatedBy,

    String changeSummary
) {
}
