package com.darevel.billing.controller.dto;

import com.darevel.billing.model.enums.BillingCycle;
import com.darevel.billing.model.enums.SubscriptionStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        UUID orgId,
        UUID planId,
        String planName,
        BillingCycle billingCycle,
        SubscriptionStatus status,
        OffsetDateTime trialEnd,
        OffsetDateTime currentPeriodStart,
        OffsetDateTime currentPeriodEnd,
        OffsetDateTime nextBillingDate,
        boolean cancelAtPeriodEnd,
        String externalCustomerId,
        String externalSubscriptionId) {}
