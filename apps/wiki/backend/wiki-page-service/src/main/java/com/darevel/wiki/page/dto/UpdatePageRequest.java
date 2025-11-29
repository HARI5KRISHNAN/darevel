package com.darevel.wiki.page.dto;

import com.darevel.wiki.page.domain.PageStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdatePageRequest(
    @NotBlank String title,
    String content,
    String summary,
    PageStatus status,
    UUID parentId,
    @NotNull UUID editorId
) { }
