package com.darevel.access.service.dto;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class PermissionCheckContext {

    private final UUID workspaceId;
    private final UUID userId;
    private final List<UUID> teamIds;
    private final String permissionCode;
    private final ResourceRef resource;

    public PermissionCheckContext(UUID workspaceId, UUID userId, List<UUID> teamIds, String permissionCode, ResourceRef resource) {
        if (workspaceId == null || userId == null || permissionCode == null) {
            throw new IllegalArgumentException("workspaceId, userId and permissionCode are required");
        }
        this.workspaceId = workspaceId;
        this.userId = userId;
        this.teamIds = teamIds == null ? List.of() : List.copyOf(teamIds);
        this.permissionCode = permissionCode;
        this.resource = resource;
    }

    public UUID getWorkspaceId() {
        return workspaceId;
    }

    public UUID getUserId() {
        return userId;
    }

    public List<UUID> getTeamIds() {
        return Collections.unmodifiableList(teamIds);
    }

    public String getPermissionCode() {
        return permissionCode;
    }

    public ResourceRef getResource() {
        return resource;
    }

    public boolean hasResource() {
        return resource != null;
    }
}
