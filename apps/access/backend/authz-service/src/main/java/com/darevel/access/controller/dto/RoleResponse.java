package com.darevel.access.controller.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record RoleResponse(
        UUID id,
        String roleKey,
        String name,
        String description,
        boolean system,
        int priority,
        List<String> permissionCodes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
