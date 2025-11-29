package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.ActivityLogEntry;
import com.darevel.admin.service.ActivityFeedService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/activity")
public class ActivityController {

    private final ActivityFeedService feedService;
    private final TenantResolver tenantResolver;

    public ActivityController(ActivityFeedService feedService, TenantResolver tenantResolver) {
        this.feedService = feedService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping("/recent")
    public List<ActivityLogEntry> recentActivity(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestParam(defaultValue = "50") int limit) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return feedService.fetchRecent(orgId, limit);
    }
}
