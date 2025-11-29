package com.darevel.access.service.dto;

import java.util.List;
import java.util.UUID;

public record PermissionEvaluationResult(
        boolean granted,
        boolean viaResourceOverride,
        List<UUID> matchedRoleIds,
        List<UUID> matchedTeamRoleIds,
        List<String> matchedResourcePermissions) {}
