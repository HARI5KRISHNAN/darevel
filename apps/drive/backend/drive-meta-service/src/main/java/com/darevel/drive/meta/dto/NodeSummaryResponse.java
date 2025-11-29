package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.NodeType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NodeSummaryResponse(
    UUID id,
    UUID spaceId,
    UUID parentId,
    String name,
    NodeType nodeType,
    String mimeType,
    long sizeBytes,
    UUID ownerId,
    OffsetDateTime updatedAt,
    boolean starred,
    boolean trashed
) { }
