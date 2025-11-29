package com.darevel.admin.dto;

import com.darevel.admin.model.TeamRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TeamMemberResponse(
    UUID userId,
    TeamRole role,
    OffsetDateTime addedAt
) {}
