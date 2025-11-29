package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.OrgSettingsRequest;
import com.darevel.admin.dto.OrgSettingsResponse;
import com.darevel.admin.service.OrgSettingsService;
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
@RequestMapping("/api/admin/org/settings")
public class OrgSettingsController {

    private final OrgSettingsService service;
    private final TenantResolver tenantResolver;

    public OrgSettingsController(OrgSettingsService service, TenantResolver tenantResolver) {
        this.service = service;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping
    public OrgSettingsResponse getSettings(@AuthenticationPrincipal Jwt jwt) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return service.getSettings(orgId);
    }

    @PostMapping
    public OrgSettingsResponse upsertSettings(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody OrgSettingsRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return service.upsertSettings(orgId, request);
    }
}
