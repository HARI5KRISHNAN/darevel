package com.darevel.access.service;

import com.darevel.access.config.AccessProperties;
import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.model.entity.RolePermissionId;
import com.darevel.access.repository.PermissionRepository;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.repository.RoleRepository;
import com.darevel.access.repository.TeamRoleRepository;
import com.darevel.access.repository.UserRoleRepository;
import com.darevel.access.service.dto.RoleMutationCommand;
import com.darevel.access.service.dto.RoleUpdateCommand;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final WorkspaceRoleProvisioner workspaceRoleProvisioner;
    private final AccessProperties properties;
    private final UserRoleRepository userRoleRepository;
    private final TeamRoleRepository teamRoleRepository;
    private final PermissionCacheService permissionCacheService;

    public List<RoleEntity> listRoles(UUID workspaceId) {
        ensureBootstrapRoles(workspaceId);
        return roleRepository.findByWorkspaceIdOrderByPriorityAsc(workspaceId);
    }

    @Transactional
    public RoleEntity createRole(UUID workspaceId, RoleMutationCommand command, UUID actorId) {
        ensureBootstrapRoles(workspaceId);
        if (roleRepository.existsByWorkspaceIdAndRoleKey(workspaceId, command.roleKey())) {
            throw new IllegalArgumentException("Role key already exists");
        }

        RoleEntity role = new RoleEntity();
        role.setWorkspaceId(workspaceId);
        role.setRoleKey(command.roleKey());
        role.setName(command.name());
        role.setDescription(command.description());
        role.setPriority(command.priority());
        role.setSystem(command.system());
        role.setCreatedBy(actorId);
        role.setUpdatedBy(actorId);

        RoleEntity saved = roleRepository.save(role);
        syncPermissions(saved, command.permissionCodes());
        return saved;
    }

    @Transactional
    public RoleEntity updateRole(UUID workspaceId, UUID roleId, RoleUpdateCommand command, UUID actorId) {
        RoleEntity role = getRole(workspaceId, roleId);
        if (role.isSystem() && command.getSystem().orElse(true) == Boolean.FALSE) {
            throw new IllegalArgumentException("System roles cannot be downgraded");
        }
        command.getName().ifPresent(role::setName);
        command.getDescription().ifPresent(role::setDescription);
        command.getPriority().ifPresent(role::setPriority);
        command.getSystem().ifPresent(role::setSystem);
        role.setUpdatedBy(actorId);

        RoleEntity saved = roleRepository.save(role);
        boolean permissionsUpdated = command.getPermissionCodes()
                .map(codes -> {
                    syncPermissions(saved, codes);
                    return true;
                })
                .orElse(false);
        if (permissionsUpdated) {
            invalidateRoleCaches(saved.getWorkspaceId(), saved.getId());
        }
        return saved;
    }

    @Transactional
    public void deleteRole(UUID workspaceId, UUID roleId) {
        RoleEntity role = getRole(workspaceId, roleId);
        if (role.isSystem()) {
            throw new IllegalStateException("Cannot delete system roles");
        }
        invalidateRoleCaches(role.getWorkspaceId(), role.getId());
        roleRepository.delete(role);
    }

    public RoleEntity getRole(UUID workspaceId, UUID roleId) {
        return roleRepository
                .findById(roleId)
                .filter(role -> role.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));
    }

    private void syncPermissions(RoleEntity role, List<String> permissionCodes) {
        if (permissionCodes == null) {
            return;
        }
        Set<String> codes = new HashSet<>(permissionCodes);
        Set<String> existing = new HashSet<>(
            permissionRepository.findByCodeIn(codes).stream().map(p -> p.getCode()).toList());

        if (existing.size() != codes.size()) {
            throw new IllegalArgumentException("One or more permissions are invalid for this workspace");
        }

        rolePermissionRepository.deleteByRoleId(role.getId());
        codes.forEach(code -> {
            RolePermissionEntity entity = new RolePermissionEntity();
            entity.setId(new RolePermissionId(role.getId(), code));
            entity.setGrantedAt(OffsetDateTime.now());
            rolePermissionRepository.save(entity);
        });
    }

    private void ensureBootstrapRoles(UUID workspaceId) {
        properties.getDefaults().getBootstrapRoles().forEach(roleKey -> workspaceRoleProvisioner.ensureTemplateRoleCloned(
                workspaceId, roleKey));
    }

    private void invalidateRoleCaches(UUID workspaceId, UUID roleId) {
        List<UUID> directAssignees = userRoleRepository.findUserIdsByWorkspaceIdAndRoleId(workspaceId, roleId);
        permissionCacheService.evictUsers(workspaceId, directAssignees);
        if (teamRoleRepository.existsByWorkspaceIdAndRoleId(workspaceId, roleId)) {
            // Team assignments fan out to many users, so drop the entire workspace namespace.
            permissionCacheService.evictWorkspace(workspaceId);
        }
    }
}
