package com.darevel.wiki.page.dto;

import com.darevel.wiki.page.domain.PageStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreatePageRequest(
    @NotNull UUID spaceId,
    UUID parentId,
    @NotBlank @Size(max = 255) String title,
    @NotBlank @Pattern(regexp = "[a-z0-9-]+") String slug,
    @NotNull PageStatus status,
    @NotNull UUID authorId,
    @NotBlank String content,
    String summary
) { }
