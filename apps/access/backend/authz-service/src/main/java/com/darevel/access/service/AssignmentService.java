package com.darevel.access.service;

import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.model.entity.TeamRoleEntity;
import com.darevel.access.model.entity.UserRoleEntity;
import com.darevel.access.model.enums.AssignmentSource;
import com.darevel.access.repository.RoleRepository;
import com.darevel.access.repository.TeamRoleRepository;
import com.darevel.access.repository.UserRoleRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final UserRoleRepository userRoleRepository;
    private final TeamRoleRepository teamRoleRepository;
    private final RoleRepository roleRepository;
    private final PermissionCacheService permissionCacheService;

    @Transactional
    public void assignRoleToUser(UUID workspaceId, UUID userId, UUID roleId, AssignmentSource source, UUID actorId) {
        RoleEntity role = getWorkspaceRole(workspaceId, roleId);
        if (userRoleRepository.existsByWorkspaceIdAndUserIdAndRoleId(workspaceId, userId, roleId)) {
            return;
        }
        UserRoleEntity assignment = new UserRoleEntity();
        assignment.setWorkspaceId(workspaceId);
        assignment.setUserId(userId);
        assignment.setRole(role);
        assignment.setAssignmentSource(source);
        assignment.setAssignedBy(actorId);
        userRoleRepository.save(assignment);
        permissionCacheService.evictUser(workspaceId, userId);
    }

    @Transactional
    public void revokeRoleFromUser(UUID workspaceId, UUID userId, UUID roleId) {
        userRoleRepository.deleteByWorkspaceIdAndUserIdAndRoleId(workspaceId, userId, roleId);
        permissionCacheService.evictUser(workspaceId, userId);
    }

    @Transactional
    public void assignRoleToTeam(UUID workspaceId, UUID teamId, UUID roleId, AssignmentSource source) {
        RoleEntity role = getWorkspaceRole(workspaceId, roleId);
        if (teamRoleRepository.existsByWorkspaceIdAndTeamIdAndRoleId(workspaceId, teamId, roleId)) {
            return;
        }
        TeamRoleEntity assignment = new TeamRoleEntity();
        assignment.setWorkspaceId(workspaceId);
        assignment.setTeamId(teamId);
        assignment.setRole(role);
        assignment.setAssignmentSource(source);
        teamRoleRepository.save(assignment);
    }

    @Transactional
    public void revokeRoleFromTeam(UUID workspaceId, UUID teamId, UUID roleId) {
        teamRoleRepository.deleteByWorkspaceIdAndTeamIdAndRoleId(workspaceId, teamId, roleId);
    }

    public List<UserRoleEntity> getUserAssignments(UUID workspaceId, UUID userId) {
        return userRoleRepository.findByWorkspaceIdAndUserId(workspaceId, userId);
    }

    public List<TeamRoleEntity> getTeamAssignments(UUID workspaceId, UUID teamId) {
        return teamRoleRepository.findByWorkspaceIdAndTeamId(workspaceId, teamId);
    }

    private RoleEntity getWorkspaceRole(UUID workspaceId, UUID roleId) {
        RoleEntity role = roleRepository
                .findById(roleId)
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));
        if (!role.getWorkspaceId().equals(workspaceId)) {
            throw new IllegalArgumentException("Role does not belong to workspace");
        }
        return role;
    }
}
