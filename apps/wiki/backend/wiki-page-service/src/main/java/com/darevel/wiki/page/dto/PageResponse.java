package com.darevel.wiki.page.dto;

import com.darevel.wiki.page.domain.PageStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PageResponse(
    UUID id,
    UUID spaceId,
    UUID parentId,
    String title,
    String slug,
    String path,
    PageStatus status,
    long currentRevision,
    UUID createdBy,
    UUID updatedBy,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<PageRevisionResponse> revisions
) { }
