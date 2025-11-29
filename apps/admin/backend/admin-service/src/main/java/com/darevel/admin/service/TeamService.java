package com.darevel.admin.service;

import com.darevel.admin.dto.AddTeamMemberRequest;
import com.darevel.admin.dto.PagedResponse;
import com.darevel.admin.dto.TeamMemberDetailsResponse;
import com.darevel.admin.dto.TeamResponse;
import com.darevel.admin.dto.CreateTeamRequest;
import com.darevel.admin.dto.UpdateTeamRequest;
import com.darevel.admin.entity.TeamEntity;
import com.darevel.admin.entity.TeamMemberEntity;
import com.darevel.admin.exception.ResourceNotFoundException;
import com.darevel.admin.integration.IdentityDirectoryClient;
import com.darevel.admin.model.TeamRole;
import com.darevel.admin.repository.TeamMemberRepository;
import com.darevel.admin.repository.TeamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final IdentityDirectoryClient identityClient;
    private final AdminAuditService auditService;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository, IdentityDirectoryClient identityClient, AdminAuditService auditService) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.identityClient = identityClient;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PagedResponse<TeamResponse> listTeams(UUID orgId, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<TeamEntity> teams = search == null || search.isBlank()
            ? teamRepository.findByOrgId(orgId, pageable)
            : teamRepository.findByOrgIdAndNameContainingIgnoreCase(orgId, search, pageable);
        List<TeamResponse> content = teams.getContent().stream()
            .map(team -> map(team, teamMemberRepository.countByTeam_Id(team.getId())))
            .toList();
        return new PagedResponse<>(content, teams.getTotalElements(), page, size);
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeam(UUID orgId, UUID teamId) {
        TeamEntity team = findTeam(orgId, teamId);
        long memberCount = teamMemberRepository.countByTeam_Id(teamId);
        return map(team, memberCount);
    }

    public TeamResponse createTeam(UUID orgId, UUID adminUserId, CreateTeamRequest request) {
        TeamEntity entity = new TeamEntity();
        entity.setOrgId(orgId);
        entity.setName(request.name());
        entity.setDescription(request.description());
        TeamEntity saved = teamRepository.save(entity);
        auditService.recordAction(orgId, adminUserId, "TEAM_CREATED", "TEAM", saved.getId(), null);
        return map(saved, 0);
    }

    public TeamResponse updateTeam(UUID orgId, UUID adminUserId, UUID teamId, UpdateTeamRequest request) {
        TeamEntity entity = findTeam(orgId, teamId);
        entity.setName(request.name());
        entity.setDescription(request.description());
        TeamEntity saved = teamRepository.save(entity);
        auditService.recordAction(orgId, adminUserId, "TEAM_UPDATED", "TEAM", saved.getId(), null);
        long memberCount = teamMemberRepository.countByTeam_Id(teamId);
        return map(saved, memberCount);
    }

    public void deleteTeam(UUID orgId, UUID adminUserId, UUID teamId) {
        TeamEntity entity = findTeam(orgId, teamId);
        teamMemberRepository.deleteByTeam_Id(teamId);
        teamRepository.delete(entity);
        auditService.recordAction(orgId, adminUserId, "TEAM_DELETED", "TEAM", teamId, null);
    }

    @Transactional(readOnly = true)
    public List<TeamMemberDetailsResponse> listMembers(UUID orgId, UUID teamId) {
        TeamEntity team = findTeam(orgId, teamId);
        return teamMemberRepository.findByTeam_Id(team.getId()).stream()
            .sorted(Comparator.comparing(TeamMemberEntity::getAddedAt))
            .map(member -> {
                IdentityDirectoryClient.UserProfile profile = identityClient.getUser(orgId, member.getUserId());
                return new TeamMemberDetailsResponse(member.getUserId(), profile.fullName(), profile.email(), member.getRole(), member.getAddedAt());
            })
            .toList();
    }

    public void addMember(UUID orgId, UUID adminUserId, UUID teamId, AddTeamMemberRequest request) {
        TeamEntity team = findTeam(orgId, teamId);
        TeamRole role = request.role() == null ? TeamRole.MEMBER : request.role();
        if (teamMemberRepository.existsByTeam_IdAndUserId(teamId, request.userId())) {
            return;
        }
        IdentityDirectoryClient.UserProfile profile = identityClient.getUser(orgId, request.userId());
        TeamMemberEntity entity = new TeamMemberEntity();
        entity.setOrgId(orgId);
        entity.setTeam(team);
        entity.setUserId(request.userId());
        entity.setRole(role);
        teamMemberRepository.save(entity);
        auditService.recordAction(orgId, adminUserId, "TEAM_MEMBER_ADDED", "TEAM", teamId, java.util.Map.of(
            "userId", request.userId().toString(),
            "role", role.name(),
            "userEmail", profile.email()
        ));
    }

    public void removeMember(UUID orgId, UUID adminUserId, UUID teamId, UUID userId) {
        findTeam(orgId, teamId);
        teamMemberRepository.findByTeam_IdAndUserId(teamId, userId)
            .ifPresent(member -> {
                teamMemberRepository.delete(member);
                auditService.recordAction(orgId, adminUserId, "TEAM_MEMBER_REMOVED", "TEAM", teamId, java.util.Map.of("userId", userId.toString()));
            });
    }

    public void updateMemberRole(UUID orgId, UUID adminUserId, UUID teamId, UUID userId, TeamRole role) {
        findTeam(orgId, teamId);
        TeamMemberEntity member = teamMemberRepository.findByTeam_IdAndUserId(teamId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Team member not found"));
        member.setRole(role);
        teamMemberRepository.save(member);
        auditService.recordAction(orgId, adminUserId, "TEAM_MEMBER_ROLE_UPDATED", "TEAM", teamId, java.util.Map.of(
            "userId", userId.toString(),
            "role", role.name()
        ));
    }

    private TeamEntity findTeam(UUID orgId, UUID teamId) {
        return teamRepository.findByOrgIdAndId(orgId, teamId)
            .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
    }

    private TeamResponse map(TeamEntity entity, long memberCount) {
        return new TeamResponse(entity.getId(), entity.getName(), entity.getDescription(), memberCount, entity.getCreatedAt(), entity.getUpdatedAt());
    }
}
