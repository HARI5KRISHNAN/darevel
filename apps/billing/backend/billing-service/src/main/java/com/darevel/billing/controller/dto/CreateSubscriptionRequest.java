package com.darevel.billing.controller.dto;

import com.darevel.billing.model.enums.BillingCycle;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateSubscriptionRequest(
        @NotNull UUID planId,
        @NotNull BillingCycle billingCycle,
        Boolean startTrial,
        Integer trialDays,
        String externalCustomerId,
        String externalSubscriptionId) {}
