package com.darevel.access.service;

import com.darevel.access.model.entity.ResourcePermissionEntity;
import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.model.entity.TeamRoleEntity;
import com.darevel.access.model.entity.UserRoleEntity;
import com.darevel.access.model.enums.SubjectType;
import com.darevel.access.repository.ResourcePermissionRepository;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.repository.TeamRoleRepository;
import com.darevel.access.repository.UserRoleRepository;
import com.darevel.access.service.dto.PermissionCheckContext;
import com.darevel.access.service.dto.PermissionEvaluationResult;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionEvaluationService {

    private final UserRoleRepository userRoleRepository;
    private final TeamRoleRepository teamRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final ResourcePermissionRepository resourcePermissionRepository;
    private final PermissionCacheService permissionCacheService;

    public PermissionEvaluationResult evaluate(PermissionCheckContext context) {
        String resourceKey = context.hasResource() ? context.getResource().resourceId() : "*";
        Boolean cached = permissionCacheService.getCachedResult(
                context.getWorkspaceId(), context.getUserId(), context.getPermissionCode(), resourceKey);
        if (cached != null) {
            return new PermissionEvaluationResult(cached, false, List.of(), List.of(), List.of());
        }

        List<UserRoleEntity> userAssignments = userRoleRepository
                .findByWorkspaceIdAndUserId(context.getWorkspaceId(), context.getUserId());
        List<TeamRoleEntity> teamAssignments = loadTeamAssignments(context);

        Set<UUID> roleIds = new HashSet<>();
        roleIds.addAll(userAssignments.stream().map(assignment -> assignment.getRole().getId()).toList());
        roleIds.addAll(teamAssignments.stream().map(assignment -> assignment.getRole().getId()).toList());

        boolean grantedViaRole = false;
        List<UUID> matchedRoleIds = new ArrayList<>();
        List<UUID> matchedTeamRoleIds = new ArrayList<>();

        if (!roleIds.isEmpty()) {
            List<RolePermissionEntity> permissions = rolePermissionRepository.findByIdRoleIdIn(roleIds);
            Set<UUID> userRoleIdSet = userAssignments.stream().map(a -> a.getRole().getId()).collect(Collectors.toSet());
            Set<UUID> teamRoleIdSet = teamAssignments.stream().map(a -> a.getRole().getId()).collect(Collectors.toSet());

            for (RolePermissionEntity entity : permissions) {
                if (context.getPermissionCode().equals(entity.getPermissionCode())) {
                    grantedViaRole = true;
                    UUID roleId = entity.getRole().getId();
                    if (userRoleIdSet.contains(roleId)) {
                        matchedRoleIds.add(roleId);
                    } else if (teamRoleIdSet.contains(roleId)) {
                        matchedTeamRoleIds.add(roleId);
                    }
                }
            }
        }

        boolean grantedViaResource = false;
        List<String> resourcePermissions = List.of();
        if (context.hasResource()) {
            resourcePermissions = resourcePermissionRepository
                    .findByWorkspaceIdAndResourceId(context.getWorkspaceId(), context.getResource().resourceId())
                    .stream()
                    .filter(entity -> entity.getResourceType() == context.getResource().resourceType())
                    .filter(entity -> context.getPermissionCode().equals(entity.getPermissionCode()))
                    .filter(entity ->
                            entity.getSubjectType() == SubjectType.USER && entity.getSubjectId().equals(context.getUserId())
                                    || entity.getSubjectType() == SubjectType.TEAM
                                            && context.getTeamIds().contains(entity.getSubjectId()))
                    .map(ResourcePermissionEntity::getPermissionCode)
                    .toList();
            grantedViaResource = !resourcePermissions.isEmpty();
        }

        boolean granted = grantedViaRole || grantedViaResource;
        permissionCacheService.cacheResult(
                context.getWorkspaceId(), context.getUserId(), context.getPermissionCode(), resourceKey, granted);
        return new PermissionEvaluationResult(granted, grantedViaResource, matchedRoleIds, matchedTeamRoleIds, resourcePermissions);
    }

    private List<TeamRoleEntity> loadTeamAssignments(PermissionCheckContext context) {
        if (context.getTeamIds().isEmpty()) {
            return List.of();
        }
        List<TeamRoleEntity> assignments = new ArrayList<>();
        for (UUID teamId : context.getTeamIds()) {
            assignments.addAll(teamRoleRepository.findByWorkspaceIdAndTeamId(context.getWorkspaceId(), teamId));
        }
        return assignments;
    }
}
