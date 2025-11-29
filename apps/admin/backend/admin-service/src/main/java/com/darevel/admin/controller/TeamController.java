package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.AddTeamMemberRequest;
import com.darevel.admin.dto.CreateTeamRequest;
import com.darevel.admin.dto.PagedResponse;
import com.darevel.admin.dto.TeamMemberDetailsResponse;
import com.darevel.admin.dto.TeamResponse;
import com.darevel.admin.dto.UpdateTeamMemberRoleRequest;
import com.darevel.admin.dto.UpdateTeamRequest;
import com.darevel.admin.model.TeamRole;
import com.darevel.admin.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/teams")
public class TeamController {

    private final TeamService teamService;
    private final TenantResolver tenantResolver;

    public TeamController(TeamService teamService, TenantResolver tenantResolver) {
        this.teamService = teamService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping
    public PagedResponse<TeamResponse> listTeams(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestParam(required = false) String search,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return teamService.listTeams(orgId, search, page, size);
    }

    @GetMapping("/{teamId}")
    public TeamResponse getTeam(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return teamService.getTeam(orgId, teamId);
    }

    @PostMapping
    public TeamResponse createTeam(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateTeamRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        return teamService.createTeam(orgId, adminUserId, request);
    }

    @PutMapping("/{teamId}")
    public TeamResponse updateTeam(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId, @Valid @RequestBody UpdateTeamRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        return teamService.updateTeam(orgId, adminUserId, teamId, request);
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        teamService.deleteTeam(orgId, adminUserId, teamId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{teamId}/members")
    public List<TeamMemberDetailsResponse> listMembers(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return teamService.listMembers(orgId, teamId);
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<Void> addMember(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId, @Valid @RequestBody AddTeamMemberRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        teamService.addMember(orgId, adminUserId, teamId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID teamId, @PathVariable UUID userId) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        teamService.removeMember(orgId, adminUserId, teamId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teamId}/members/{userId}/role")
    public ResponseEntity<Void> updateRole(@AuthenticationPrincipal Jwt jwt,
                                           @PathVariable UUID teamId,
                                           @PathVariable UUID userId,
                                           @Valid @RequestBody UpdateTeamMemberRoleRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        TeamRole role = request.role();
        teamService.updateMemberRole(orgId, adminUserId, teamId, userId, role);
        return ResponseEntity.ok().build();
    }
}
