package com.darevel.access.controller;

import com.darevel.access.controller.dto.ResourcePermissionRequest;
import com.darevel.access.controller.dto.ResourcePermissionResponse;
import com.darevel.access.model.entity.ResourcePermissionEntity;
import com.darevel.access.model.enums.ResourceType;
import com.darevel.access.service.ResourcePermissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/authz/resources", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class ResourcePermissionController {

    private final ResourcePermissionService resourcePermissionService;

    public ResourcePermissionController(ResourcePermissionService resourcePermissionService) {
        this.resourcePermissionService = resourcePermissionService;
    }

    @PostMapping(value = "/permissions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResourcePermissionResponse grantPermission(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @RequestHeader("X-User-Id") @NotBlank String actorHeader,
            @Valid @RequestBody ResourcePermissionRequest request) {
        ResourcePermissionEntity entity = resourcePermissionService.grantPermission(
                UUID.fromString(workspaceHeader),
                request.resourceId(),
                request.resourceType(),
                request.subjectId(),
                request.subjectType(),
                request.permissionCode(),
                UUID.fromString(actorHeader));
        return toResponse(entity);
    }

    @DeleteMapping(value = "/permissions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void revokePermission(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @Valid @RequestBody ResourcePermissionRequest request) {
        resourcePermissionService.revokePermission(
                UUID.fromString(workspaceHeader),
                request.resourceId(),
                request.resourceType(),
                request.subjectId(),
                request.subjectType(),
                request.permissionCode());
    }

    @GetMapping("/{resourceType}/{resourceId}/permissions")
    public List<ResourcePermissionResponse> listPermissions(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @PathVariable String resourceType,
            @PathVariable String resourceId) {
        return resourcePermissionService
                .listResourcePermissions(
                        UUID.fromString(workspaceHeader), resourceId, ResourceType.valueOf(resourceType.toUpperCase()))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ResourcePermissionResponse toResponse(ResourcePermissionEntity entity) {
        return new ResourcePermissionResponse(
                entity.getId(),
                entity.getSubjectId(),
                entity.getSubjectType(),
                entity.getPermissionCode(),
                entity.getGrantedAt(),
                entity.getGrantedBy());
    }
}
