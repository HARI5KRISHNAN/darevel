package com.darevel.access.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record RoleRequest(
        @NotBlank String roleKey,
        @NotBlank String name,
        String description,
        boolean system,
        @Positive int priority,
        @NotEmpty List<@NotBlank String> permissionCodes) {}
