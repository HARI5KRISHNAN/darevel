package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to release an editing lock
 */
public record ReleaseLockRequest(
    @NotNull(message = "Page ID is required")
    UUID pageId,

    @NotNull(message = "User ID is required")
    UUID userId,

    @NotBlank(message = "Session ID is required")
    String sessionId
) {
}
