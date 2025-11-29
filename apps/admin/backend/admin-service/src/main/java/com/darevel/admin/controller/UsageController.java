package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.BillingSummaryResponse;
import com.darevel.admin.dto.UsageActivityResponse;
import com.darevel.admin.dto.UsageSummaryResponse;
import com.darevel.admin.service.UsageAggregationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class UsageController {

    private final UsageAggregationService usageService;
    private final TenantResolver tenantResolver;

    public UsageController(UsageAggregationService usageService, TenantResolver tenantResolver) {
        this.usageService = usageService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping("/usage/summary")
    public UsageSummaryResponse getUsageSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return usageService.getUsageSummary(orgId);
    }

    @GetMapping("/usage/activity")
    public UsageActivityResponse getUsageActivity(@AuthenticationPrincipal Jwt jwt) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return usageService.getUsageActivity(orgId);
    }

    @GetMapping("/billing/summary")
    public BillingSummaryResponse getBillingSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return usageService.getBillingSummary(orgId);
    }
}
