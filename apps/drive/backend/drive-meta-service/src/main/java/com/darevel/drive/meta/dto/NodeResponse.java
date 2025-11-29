package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.NodeType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record NodeResponse(
    UUID id,
    UUID spaceId,
    UUID parentId,
    String name,
    NodeType nodeType,
    String mimeType,
    long sizeBytes,
    UUID ownerId,
    String storageKey,
    OffsetDateTime deletedAt,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    boolean starred,
    List<FileVersionResponse> versions
) { }
