package com.darevel.access.controller.dto;

import com.darevel.access.model.enums.ResourceType;
import com.darevel.access.model.enums.SubjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ResourcePermissionRequest(
        @NotBlank String resourceId,
        @NotNull ResourceType resourceType,
        @NotNull UUID subjectId,
        @NotNull SubjectType subjectType,
        @NotBlank String permissionCode) {}
