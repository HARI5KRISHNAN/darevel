package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to acquire an editing lock on a page
 */
public record AcquireLockRequest(
    @NotNull(message = "Page ID is required")
    UUID pageId,

    @NotNull(message = "User ID is required")
    UUID userId,

    @NotNull(message = "Session ID is required")
    String sessionId
) {
}
