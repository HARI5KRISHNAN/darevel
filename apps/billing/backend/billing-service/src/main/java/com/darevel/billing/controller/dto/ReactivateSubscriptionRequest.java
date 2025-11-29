package com.darevel.billing.controller.dto;

import com.darevel.billing.model.enums.BillingCycle;
import java.util.UUID;

public record ReactivateSubscriptionRequest(UUID planId, BillingCycle billingCycle) {}
