package com.darevel.admin.service;

import com.darevel.admin.dto.CreateUserRequest;
import com.darevel.admin.dto.PagedResponse;
import com.darevel.admin.dto.RoleUpdateRequest;
import com.darevel.admin.dto.UpdateUserRequest;
import com.darevel.admin.dto.UserResponse;
import com.darevel.admin.integration.IdentityDirectoryClient;
import com.darevel.admin.model.TeamRole;
import com.darevel.admin.repository.TeamMemberRepository;
import com.darevel.admin.repository.TeamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserManagementService {

    private final IdentityDirectoryClient identityClient;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final AdminAuditService auditService;

    public UserManagementService(IdentityDirectoryClient identityClient, TeamMemberRepository teamMemberRepository, TeamRepository teamRepository, AdminAuditService auditService) {
        this.identityClient = identityClient;
        this.teamMemberRepository = teamMemberRepository;
        this.teamRepository = teamRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> listUsers(UUID orgId, String search, int page, int size) {
        IdentityDirectoryClient.PagedUsers users = identityClient.fetchUsers(orgId, search, page, size);
        List<UUID> userIds = users.content().stream().map(IdentityDirectoryClient.UserProfile::id).toList();
        java.util.Set<UUID> userIdSet = new java.util.HashSet<>(userIds);
        Map<UUID, List<UUID>> memberships = teamMemberRepository.findByOrgId(orgId).stream()
            .filter(member -> userIdSet.contains(member.getUserId()))
            .collect(Collectors.groupingBy(
                member -> member.getUserId(),
                Collectors.mapping(member -> member.getTeam().getId(), Collectors.toList())));
        List<UserResponse> content = users.content().stream()
            .map(profile -> mapProfile(orgId, profile, memberships.getOrDefault(profile.id(), List.of())))
            .toList();
        return new PagedResponse<>(content, users.totalElements(), users.page(), users.size());
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID orgId, UUID userId) {
        IdentityDirectoryClient.UserProfile profile = identityClient.getUser(orgId, userId);
        List<UUID> teamIds = teamMemberRepository.findByOrgIdAndUserId(orgId, userId).stream()
            .map(member -> member.getTeam().getId())
            .toList();
        return mapProfile(orgId, profile, teamIds);
    }

    public UserResponse createUser(UUID orgId, UUID adminUserId, CreateUserRequest request) {
        IdentityDirectoryClient.CreateOrUpdateUser payload = new IdentityDirectoryClient.CreateOrUpdateUser(
            request.email(),
            request.fullName(),
            defaultRoles(request.roles())
        );
        IdentityDirectoryClient.UserProfile profile = identityClient.createUser(orgId, payload);
        syncTeamMemberships(orgId, profile.id(), request.teamIds());
        auditService.recordAction(orgId, adminUserId, "USER_CREATED", "USER", profile.id(), Map.of("email", profile.email()));
        return getUser(orgId, profile.id());
    }

    public UserResponse updateUser(UUID orgId, UUID adminUserId, UUID userId, UpdateUserRequest request) {
        IdentityDirectoryClient.CreateOrUpdateUser payload = new IdentityDirectoryClient.CreateOrUpdateUser(
            request.email(),
            request.fullName(),
            defaultRoles(request.roles())
        );
        identityClient.updateUser(orgId, userId, payload);
        syncTeamMemberships(orgId, userId, request.teamIds());
        auditService.recordAction(orgId, adminUserId, "USER_UPDATED", "USER", userId, Map.of("email", request.email()));
        return getUser(orgId, userId);
    }

    public void deleteUser(UUID orgId, UUID adminUserId, UUID userId) {
        identityClient.deleteUser(orgId, userId);
        teamMemberRepository.findByOrgIdAndUserId(orgId, userId)
            .forEach(teamMemberRepository::delete);
        auditService.recordAction(orgId, adminUserId, "USER_DELETED", "USER", userId, null);
    }

    public void deactivateUser(UUID orgId, UUID adminUserId, UUID userId) {
        identityClient.deactivateUser(orgId, userId);
        auditService.recordAction(orgId, adminUserId, "USER_DEACTIVATED", "USER", userId, null);
    }

    public void reactivateUser(UUID orgId, UUID adminUserId, UUID userId) {
        identityClient.reactivateUser(orgId, userId);
        auditService.recordAction(orgId, adminUserId, "USER_REACTIVATED", "USER", userId, null);
    }

    public UserResponse updateRoles(UUID orgId, UUID adminUserId, UUID userId, RoleUpdateRequest request) {
        IdentityDirectoryClient.UserProfile profile = identityClient.updateRoles(orgId, userId, request.roles());
        auditService.recordAction(orgId, adminUserId, "USER_ROLES_UPDATED", "USER", userId, Map.of("roles", request.roles()));
        List<UUID> teamIds = teamMemberRepository.findByOrgIdAndUserId(orgId, userId).stream()
            .map(member -> member.getTeam().getId())
            .toList();
        return mapProfile(orgId, profile, teamIds);
    }

    private UserResponse mapProfile(UUID orgId, IdentityDirectoryClient.UserProfile profile, List<UUID> teamIds) {
        List<String> teamNames = teamIds.isEmpty() ? List.of() :
            teamRepository.findByOrgIdAndIdIn(orgId, teamIds).stream()
                .map(team -> team.getName())
                .toList();
        return new UserResponse(profile.id(), profile.orgId(), profile.email(), profile.fullName(), profile.status(), profile.roles(), teamNames);
    }

    private void syncTeamMemberships(UUID orgId, UUID userId, List<UUID> requestedTeamIds) {
        List<UUID> incoming = requestedTeamIds == null ? List.of() : requestedTeamIds;
        var existingMembers = teamMemberRepository.findByOrgIdAndUserId(orgId, userId);
        var existingTeamIds = existingMembers.stream().map(member -> member.getTeam().getId()).toList();
        // remove memberships not requested
        existingMembers.stream()
            .filter(member -> !incoming.contains(member.getTeam().getId()))
            .forEach(teamMemberRepository::delete);
        // add missing memberships
        incoming.stream()
            .filter(teamId -> !existingTeamIds.contains(teamId))
            .map(teamId -> teamRepository.findByOrgIdAndId(orgId, teamId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid team")))
            .forEach(team -> {
                var entity = new com.darevel.admin.entity.TeamMemberEntity();
                entity.setOrgId(orgId);
                entity.setTeam(team);
                entity.setUserId(userId);
                entity.setRole(TeamRole.MEMBER);
                teamMemberRepository.save(entity);
            });
    }

    private List<String> defaultRoles(List<String> roles) {
        return roles == null ? List.of("MEMBER") : roles;
    }
}
