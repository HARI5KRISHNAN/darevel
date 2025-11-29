package com.darevel.access.bootstrap;

import java.util.List;

public record RoleTemplate(
        String key,
        String name,
        String description,
        int priority,
        boolean system,
        List<String> permissions) {}
