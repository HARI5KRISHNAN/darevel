package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceVisibility;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SpaceSummaryResponse(
    UUID id,
    UUID ownerId,
    String name,
    String description,
    SpaceVisibility visibility,
    int memberCount,
    OffsetDateTime updatedAt
) { }
