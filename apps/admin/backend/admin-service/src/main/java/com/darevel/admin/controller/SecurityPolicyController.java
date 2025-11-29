package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.SecurityPolicyRequest;
import com.darevel.admin.dto.SecurityPolicyResponse;
import com.darevel.admin.service.SecurityPolicyService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/security/policies")
public class SecurityPolicyController {

    private final SecurityPolicyService service;
    private final TenantResolver tenantResolver;

    public SecurityPolicyController(SecurityPolicyService service, TenantResolver tenantResolver) {
        this.service = service;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping
    public SecurityPolicyResponse getPolicy(@AuthenticationPrincipal Jwt jwt) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return service.getPolicy(orgId);
    }

    @PostMapping
    public SecurityPolicyResponse upsertPolicy(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SecurityPolicyRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return service.upsertPolicy(orgId, request);
    }
}
