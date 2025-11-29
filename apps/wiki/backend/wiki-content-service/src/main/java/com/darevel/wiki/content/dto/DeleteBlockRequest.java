package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to delete a block from page content
 */
public record DeleteBlockRequest(
    @NotNull(message = "Expected version is required")
    Long expectedVersion,

    @NotNull(message = "User ID is required")
    UUID userId
) {
}
