package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.SpaceType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SpaceResponse(
    UUID id,
    UUID ownerId,
    String name,
    SpaceType type,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) { }
