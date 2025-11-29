package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.PermissionLevel;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PermissionResponse(
    UUID id,
    UUID nodeId,
    UUID userId,
    PermissionLevel permissionLevel,
    UUID grantedBy,
    OffsetDateTime createdAt
) {}
