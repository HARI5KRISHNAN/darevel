package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request to update an existing comment
 */
public record UpdateCommentRequest(
    @NotBlank(message = "Comment content cannot be empty")
    String content,

    @NotNull(message = "User ID is required")
    UUID userId
) {
}
