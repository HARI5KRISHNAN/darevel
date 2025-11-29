package com.darevel.billing.controller;

import com.darevel.billing.config.TenantResolver;
import com.darevel.billing.controller.dto.LimitCheckResponse;
import com.darevel.billing.service.LimitService;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/billing/limit", produces = MediaType.APPLICATION_JSON_VALUE)
public class LimitController {

    private final LimitService limitService;
    private final TenantResolver tenantResolver;

    public LimitController(LimitService limitService, TenantResolver tenantResolver) {
        this.limitService = limitService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping("/check")
    public LimitCheckResponse checkLimits(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @RequestParam(name = "orgId", required = false) UUID orgIdParam) {
        UUID orgId = orgIdParam != null ? orgIdParam : tenantResolver.resolveOrgId(jwt, orgHeader);
        return limitService.check(orgId);
    }
}
