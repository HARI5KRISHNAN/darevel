package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.PermissionLevel;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateShareLinkRequest(
    @NotNull PermissionLevel permissionLevel,
    @NotNull UUID createdBy,
    OffsetDateTime expiresAt,
    String password,
    Long maxDownloads
) {}
