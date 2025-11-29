package com.darevel.access.controller;

import com.darevel.access.controller.dto.PermissionCheckRequest;
import com.darevel.access.controller.dto.PermissionCheckResponse;
import com.darevel.access.service.PermissionEvaluationService;
import com.darevel.access.service.dto.PermissionCheckContext;
import com.darevel.access.service.dto.PermissionEvaluationResult;
import com.darevel.access.service.dto.ResourceRef;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/authz/check", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class PermissionCheckController {

    private final PermissionEvaluationService permissionEvaluationService;

    public PermissionCheckController(PermissionEvaluationService permissionEvaluationService) {
        this.permissionEvaluationService = permissionEvaluationService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public PermissionCheckResponse checkPermission(
            @RequestHeader("X-Org-Id") @NotBlank String workspaceHeader,
            @RequestHeader("X-User-Id") @NotBlank String userHeader,
            @Valid @RequestBody PermissionCheckRequest request) {
        UUID workspaceId = UUID.fromString(workspaceHeader);
        UUID actorId = UUID.fromString(userHeader);
        UUID subjectId = request.subjectOrDefault(actorId);

        ResourceRef resourceRef = null;
        if (request.resource() != null) {
            resourceRef = new ResourceRef(request.resource().resourceId(), request.resource().resourceType());
        }

        PermissionCheckContext context = new PermissionCheckContext(
                workspaceId, subjectId, request.safeTeamIds(), request.permissionCode(), resourceRef);
        PermissionEvaluationResult result = permissionEvaluationService.evaluate(context);
        return new PermissionCheckResponse(
                result.granted(),
                result.viaResourceOverride(),
                result.matchedRoleIds(),
                result.matchedTeamRoleIds(),
                result.matchedResourcePermissions());
    }
}
