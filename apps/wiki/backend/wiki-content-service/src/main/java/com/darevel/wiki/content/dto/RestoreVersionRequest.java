package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to restore a specific content version
 */
public record RestoreVersionRequest(
    @NotNull(message = "User ID is required")
    UUID userId,

    @NotNull(message = "Expected version is required")
    Long expectedVersion
) {
}
