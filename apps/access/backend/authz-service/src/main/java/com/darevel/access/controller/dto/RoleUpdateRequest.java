package com.darevel.access.controller.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record RoleUpdateRequest(
        String name,
        String description,
        Integer priority,
        Boolean system,
        List<@NotBlank String> permissionCodes) {}
