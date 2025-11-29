package com.darevel.wiki.content.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request to add a comment on a block
 */
public record AddCommentRequest(
    @NotNull(message = "Page ID is required")
    UUID pageId,

    @NotNull(message = "Block ID is required")
    String blockId,

    UUID parentId,  // Null for top-level comments

    @NotBlank(message = "Comment content cannot be empty")
    String content,

    @NotNull(message = "User ID is required")
    UUID createdBy,

    List<UUID> mentions  // User IDs mentioned in the comment
) {
}
