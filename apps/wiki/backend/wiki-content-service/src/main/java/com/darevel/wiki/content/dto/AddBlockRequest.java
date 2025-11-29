package com.darevel.wiki.content.dto;

import com.darevel.wiki.content.domain.Block;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to add a block to page content
 */
public record AddBlockRequest(
    @NotNull(message = "Block is required")
    Block block,

    @NotNull(message = "Expected version is required")
    Long expectedVersion,

    @NotNull(message = "User ID is required")
    UUID userId
) {
}
