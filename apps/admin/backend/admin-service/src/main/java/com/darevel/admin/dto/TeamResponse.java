package com.darevel.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TeamResponse(
    UUID id,
    String name,
    String description,
    long memberCount,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
