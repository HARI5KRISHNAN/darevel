package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.PermissionLevel;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GrantPermissionRequest(
    @NotNull UUID userId,
    @NotNull PermissionLevel permissionLevel,
    @NotNull UUID grantedBy
) {}
