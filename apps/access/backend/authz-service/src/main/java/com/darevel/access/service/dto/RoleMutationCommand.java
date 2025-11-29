package com.darevel.access.service.dto;

import java.util.List;

public record RoleMutationCommand(
        String roleKey,
        String name,
        String description,
        boolean system,
        int priority,
        List<String> permissionCodes) {

    public RoleMutationCommand {
        if (roleKey == null || roleKey.isBlank()) {
            throw new IllegalArgumentException("roleKey is required");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (priority <= 0) {
            priority = 100;
        }
    }
}
