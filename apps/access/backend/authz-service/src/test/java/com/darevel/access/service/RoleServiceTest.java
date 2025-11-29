package com.darevel.access.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.darevel.access.config.AccessProperties;
import com.darevel.access.model.entity.PermissionEntity;
import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.repository.PermissionRepository;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.repository.RoleRepository;
import com.darevel.access.repository.TeamRoleRepository;
import com.darevel.access.repository.UserRoleRepository;
import com.darevel.access.service.dto.RoleUpdateCommand;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RoleServiceTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private RolePermissionRepository rolePermissionRepository;

    @Mock
    private WorkspaceRoleProvisioner workspaceRoleProvisioner;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private TeamRoleRepository teamRoleRepository;

    @Mock
    private PermissionCacheService permissionCacheService;

    private RoleService roleService;

    @BeforeEach
    void setUp() {
        AccessProperties properties = new AccessProperties();
        roleService = new RoleService(
                roleRepository,
                permissionRepository,
                rolePermissionRepository,
                workspaceRoleProvisioner,
                properties,
                userRoleRepository,
                teamRoleRepository,
                permissionCacheService);
    }

    @Test
    void updateRole_withPermissionChanges_evictsCaches() {
        UUID workspaceId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        RoleEntity role = workspaceRole(workspaceId, roleId);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(roleRepository.save(any(RoleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(permissionRepository.findByCodeIn(any())).thenReturn(List.of(permission("docs.read")));
        List<UUID> impactedUsers = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(userRoleRepository.findUserIdsByWorkspaceIdAndRoleId(workspaceId, roleId)).thenReturn(impactedUsers);
        when(teamRoleRepository.existsByWorkspaceIdAndRoleId(workspaceId, roleId)).thenReturn(true);

        RoleUpdateCommand command = new RoleUpdateCommand("New Name", null, null, null, List.of("docs.read"));
        roleService.updateRole(workspaceId, roleId, command, actorId);

        verify(permissionCacheService).evictUsers(workspaceId, impactedUsers);
        verify(permissionCacheService).evictWorkspace(workspaceId);
    }

    @Test
    void updateRole_withoutPermissionChanges_doesNotEvictCaches() {
        UUID workspaceId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();
        UUID actorId = UUID.randomUUID();
        RoleEntity role = workspaceRole(workspaceId, roleId);

        when(roleRepository.findById(roleId)).thenReturn(Optional.of(role));
        when(roleRepository.save(any(RoleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoleUpdateCommand command = new RoleUpdateCommand("Rename", null, 25, null, null);
        roleService.updateRole(workspaceId, roleId, command, actorId);

        verifyNoInteractions(permissionCacheService);
        verify(permissionRepository, never()).findByCodeIn(any());
    }

    private static RoleEntity workspaceRole(UUID workspaceId, UUID roleId) {
        RoleEntity role = new RoleEntity();
        role.setId(roleId);
        role.setWorkspaceId(workspaceId);
        role.setName("Test Role");
        role.setRoleKey("test-role");
        role.setSystem(false);
        return role;
    }

    private static PermissionEntity permission(String code) {
        PermissionEntity entity = new PermissionEntity();
        entity.setCode(code);
        entity.setName(code);
        entity.setModule("test");
        return entity;
    }
}
