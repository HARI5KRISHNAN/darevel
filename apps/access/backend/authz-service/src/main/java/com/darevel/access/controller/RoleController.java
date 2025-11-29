package com.darevel.access.controller;

import com.darevel.access.controller.dto.RoleRequest;
import com.darevel.access.controller.dto.RoleResponse;
import com.darevel.access.controller.dto.RoleUpdateRequest;
import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.service.RoleService;
import com.darevel.access.service.dto.RoleMutationCommand;
import com.darevel.access.service.dto.RoleUpdateCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/authz/roles", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class RoleController {

    private final RoleService roleService;
    private final RolePermissionRepository rolePermissionRepository;

    public RoleController(RoleService roleService, RolePermissionRepository rolePermissionRepository) {
        this.roleService = roleService;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    @GetMapping
    public List<RoleResponse> listRoles(@RequestHeader("X-Org-Id") @NotBlank String workspaceHeader) {
        UUID workspaceId = UUID.fromString(workspaceHeader);
        List<RoleEntity> roles = roleService.listRoles(workspaceId);
        Map<UUID, List<String>> permissionIndex = loadPermissions(roles);
        return roles.stream().map(role -> toResponse(role, permissionIndex)).toList();
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        public RoleResponse createRole(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @RequestHeader("X-User-Id") @NotBlank String actorHeader,
            @Valid @RequestBody RoleRequest request) {
        UUID workspaceId = UUID.fromString(workspaceHeader);
        UUID actorId = UUID.fromString(actorHeader);
        RoleEntity created = roleService.createRole(
                workspaceId,
                new RoleMutationCommand(
                        request.roleKey(),
                        request.name(),
                        request.description(),
                        request.system(),
                        request.priority(),
                        request.permissionCodes()),
                actorId);
        Map<UUID, List<String>> permissionIndex = Map.of(created.getId(), request.permissionCodes());
        return toResponse(created, permissionIndex);
    }

    @PutMapping(value = "/{roleId}", consumes = MediaType.APPLICATION_JSON_VALUE)
        public RoleResponse updateRole(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @RequestHeader("X-User-Id") @NotBlank String actorHeader,
            @PathVariable UUID roleId,
            @Valid @RequestBody RoleUpdateRequest request) {
        UUID workspaceId = UUID.fromString(workspaceHeader);
        UUID actorId = UUID.fromString(actorHeader);
        RoleEntity updated = roleService.updateRole(
                workspaceId,
                roleId,
                new RoleUpdateCommand(
                        request.name(),
                        request.description(),
                        request.priority(),
                        request.system(),
                        request.permissionCodes()),
                actorId);
        Map<UUID, List<String>> permissionIndex = loadPermissions(List.of(updated));
        return toResponse(updated, permissionIndex);
    }

    @DeleteMapping("/{roleId}")
    public void deleteRole(@RequestHeader("X-Org-Id") @NotBlank String workspaceHeader, @PathVariable UUID roleId) {
        UUID workspaceId = UUID.fromString(workspaceHeader);
        roleService.deleteRole(workspaceId, roleId);
    }

    private Map<UUID, List<String>> loadPermissions(List<RoleEntity> roles) {
        if (roles.isEmpty()) {
            return Collections.emptyMap();
        }
        List<UUID> ids = roles.stream().map(RoleEntity::getId).toList();
        List<RolePermissionEntity> entities = rolePermissionRepository.findByIdRoleIdIn(ids);
        return entities.stream()
                .collect(Collectors.groupingBy(
                        rolePermission -> rolePermission.getId().getRoleId(),
                        HashMap::new,
                        Collectors.mapping(RolePermissionEntity::getPermissionCode, Collectors.toList())));
    }

    private RoleResponse toResponse(RoleEntity role, Map<UUID, List<String>> permissionIndex) {
        List<String> permissions = permissionIndex.getOrDefault(role.getId(), List.of());
        return new RoleResponse(
                role.getId(),
                role.getRoleKey(),
                role.getName(),
                role.getDescription(),
                role.isSystem(),
                role.getPriority(),
                permissions,
                role.getCreatedAt(),
                role.getUpdatedAt());
    }
}
