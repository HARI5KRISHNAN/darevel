package com.darevel.access.controller;

import com.darevel.access.controller.dto.TeamAssignmentRequest;
import com.darevel.access.controller.dto.TeamAssignmentsResponse;
import com.darevel.access.controller.dto.UserAssignmentRequest;
import com.darevel.access.controller.dto.UserAssignmentsResponse;
import com.darevel.access.service.AssignmentService;
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
@RequestMapping(value = "/api/authz/assignments", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping(value = "/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void assignRoleToUser(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @RequestHeader("X-User-Id") @NotBlank String actorHeader,
            @Valid @RequestBody UserAssignmentRequest request) {
        assignmentService.assignRoleToUser(
                UUID.fromString(workspaceHeader),
                request.userId(),
                request.roleId(),
                request.effectiveSource(),
                UUID.fromString(actorHeader));
    }

    @DeleteMapping(value = "/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void revokeRoleFromUser(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @Valid @RequestBody UserAssignmentRequest request) {
        assignmentService.revokeRoleFromUser(UUID.fromString(workspaceHeader), request.userId(), request.roleId());
    }

    @GetMapping("/users/{userId}")
    public UserAssignmentsResponse listUserAssignments(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader, @PathVariable UUID userId) {
        List<UUID> roleIds = assignmentService.getUserAssignments(UUID.fromString(workspaceHeader), userId).stream()
                .map(assignment -> assignment.getRole().getId())
                .toList();
        return new UserAssignmentsResponse(userId, roleIds);
    }

    @PostMapping(value = "/teams", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void assignRoleToTeam(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @Valid @RequestBody TeamAssignmentRequest request) {
        assignmentService.assignRoleToTeam(
                UUID.fromString(workspaceHeader), request.teamId(), request.roleId(), request.effectiveSource());
    }

    @DeleteMapping(value = "/teams", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void revokeRoleFromTeam(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @Valid @RequestBody TeamAssignmentRequest request) {
        assignmentService.revokeRoleFromTeam(UUID.fromString(workspaceHeader), request.teamId(), request.roleId());
    }

    @GetMapping("/teams/{teamId}")
    public TeamAssignmentsResponse listTeamAssignments(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader, @PathVariable UUID teamId) {
        List<UUID> roleIds = assignmentService.getTeamAssignments(UUID.fromString(workspaceHeader), teamId).stream()
                .map(assignment -> assignment.getRole().getId())
                .toList();
        return new TeamAssignmentsResponse(teamId, roleIds);
    }
}
