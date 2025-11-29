package com.darevel.billing.controller;

import com.darevel.billing.config.TenantResolver;
import com.darevel.billing.controller.dto.CancelSubscriptionRequest;
import com.darevel.billing.controller.dto.CreateSubscriptionRequest;
import com.darevel.billing.controller.dto.ReactivateSubscriptionRequest;
import com.darevel.billing.controller.dto.SubscriptionResponse;
import com.darevel.billing.controller.dto.UpdateSubscriptionRequest;
import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.service.SubscriptionService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/billing/subscriptions", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final TenantResolver tenantResolver;

    public SubscriptionController(SubscriptionService subscriptionService, TenantResolver tenantResolver) {
        this.subscriptionService = subscriptionService;
        this.tenantResolver = tenantResolver;
    }

    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SubscriptionResponse createSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @Valid @RequestBody CreateSubscriptionRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, orgHeader);
        SubscriptionEntity entity = subscriptionService.createSubscription(orgId, request);
        return toResponse(entity);
    }

    @GetMapping("/{orgId}")
    public SubscriptionResponse getSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @PathVariable UUID orgId) {
        tenantResolver.assertSameOrg(orgId, jwt, orgHeader);
        SubscriptionEntity entity = subscriptionService.getSubscription(orgId);
        return toResponse(entity);
    }

    @PostMapping(value = "/update", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SubscriptionResponse updateSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @Valid @RequestBody UpdateSubscriptionRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, orgHeader);
        SubscriptionEntity entity = subscriptionService.updateSubscription(orgId, request);
        return toResponse(entity);
    }

    @PostMapping(value = "/cancel", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SubscriptionResponse cancelSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @Valid @RequestBody CancelSubscriptionRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, orgHeader);
        SubscriptionEntity entity = subscriptionService.cancelSubscription(orgId, request);
        return toResponse(entity);
    }

    @PostMapping(value = "/reactivate", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SubscriptionResponse reactivateSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestHeader(value = "X-Org-Id", required = false) String orgHeader,
            @Valid @RequestBody ReactivateSubscriptionRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, orgHeader);
        SubscriptionEntity entity = subscriptionService.reactivate(orgId, request);
        return toResponse(entity);
    }

    private SubscriptionResponse toResponse(SubscriptionEntity entity) {
        return new SubscriptionResponse(
                entity.getId(),
                entity.getOrgId(),
                entity.getPlan().getId(),
                entity.getPlan().getName(),
                entity.getBillingCycle(),
                entity.getStatus(),
                entity.getTrialEnd(),
                entity.getCurrentPeriodStart(),
                entity.getCurrentPeriodEnd(),
                entity.getNextBillingDate(),
                entity.isCancelAtPeriodEnd(),
                entity.getExternalCustomerId(),
                entity.getExternalSubscriptionId());
    }
}
