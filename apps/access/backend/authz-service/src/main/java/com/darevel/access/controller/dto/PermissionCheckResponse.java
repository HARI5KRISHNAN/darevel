package com.darevel.access.controller.dto;

import java.util.List;
import java.util.UUID;

public record PermissionCheckResponse(
        boolean granted,
        boolean viaResourceOverride,
        List<UUID> matchedRoleIds,
        List<UUID> matchedTeamRoleIds,
        List<String> matchedResourcePermissions) {}
