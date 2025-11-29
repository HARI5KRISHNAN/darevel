package com.darevel.admin.dto;

import com.darevel.admin.model.TeamRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TeamMemberDetailsResponse(
    UUID userId,
    String fullName,
    String email,
    TeamRole role,
    OffsetDateTime addedAt
) {}
