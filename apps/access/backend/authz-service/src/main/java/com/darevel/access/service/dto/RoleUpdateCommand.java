package com.darevel.access.service.dto;

import java.util.List;
import java.util.Optional;

public record RoleUpdateCommand(
        String name,
        String description,
        Integer priority,
        Boolean system,
        List<String> permissionCodes) {

    public Optional<String> getName() {
        return Optional.ofNullable(name);
    }

    public Optional<String> getDescription() {
        return Optional.ofNullable(description);
    }

    public Optional<Integer> getPriority() {
        return Optional.ofNullable(priority);
    }

    public Optional<Boolean> getSystem() {
        return Optional.ofNullable(system);
    }

    public Optional<List<String>> getPermissionCodes() {
        return Optional.ofNullable(permissionCodes);
    }
}
