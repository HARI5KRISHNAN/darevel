package com.darevel.access.controller.dto;

import com.darevel.access.model.enums.ResourceType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record PermissionCheckRequest(
        @NotBlank String permissionCode,
        UUID subjectUserId,
        List<UUID> teamIds,
        @Valid ResourceTarget resource) {

    public UUID subjectOrDefault(UUID fallback) {
        return subjectUserId == null ? fallback : subjectUserId;
    }

    public List<UUID> safeTeamIds() {
        return teamIds == null ? List.of() : List.copyOf(teamIds);
    }

    public record ResourceTarget(@NotBlank String resourceId, @NotNull ResourceType resourceType) {}
}
