package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceVisibility;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record SpaceResponse(
    UUID id,
    UUID ownerId,
    String name,
    String description,
    SpaceVisibility visibility,
    int memberCount,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<SpaceMemberResponse> members
) { }
