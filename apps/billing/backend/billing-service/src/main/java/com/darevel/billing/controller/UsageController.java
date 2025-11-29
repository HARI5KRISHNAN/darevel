package com.darevel.billing.controller;

import com.darevel.billing.config.TenantResolver;
import com.darevel.billing.controller.dto.UsageReportRequest;
import com.darevel.billing.controller.dto.UsageResponse;
import com.darevel.billing.model.entity.UsageRecordEntity;
import com.darevel.billing.service.UsageService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/billing/usage", produces = MediaType.APPLICATION_JSON_VALUE)
public class UsageController {

    private final UsageService usageService;
    private final TenantResolver tenantResolver;

    public UsageController(UsageService usageService, TenantResolver tenantResolver) {
        this.usageService = usageService;
        this.tenantResolver = tenantResolver;
    }

    @PostMapping(value = "/report", consumes = MediaType.APPLICATION_JSON_VALUE)
    public UsageResponse reportUsage(@Valid @RequestBody UsageReportRequest request) {
        UsageRecordEntity saved = usageService.recordUsage(request);
        return toResponse(saved);
    }

    @GetMapping
    public List<UsageResponse> listUsage(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @RequestParam(name = "orgId", required = false) UUID orgIdParam) {
        UUID orgId = orgIdParam != null ? orgIdParam : tenantResolver.resolveOrgId(jwt, orgHeader);
        return usageService.getUsage(orgId).stream().map(this::toResponse).toList();
    }

    private UsageResponse toResponse(UsageRecordEntity entity) {
        return new UsageResponse(
                entity.getId(),
                entity.getOrgId(),
                entity.getUsersCount(),
                entity.getStorageUsedGb(),
                entity.getDocsCount(),
                entity.getFilesCount(),
                entity.getEmailsSent(),
                entity.getRecordedAt());
    }
}
