package com.darevel.billing.controller.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record PlanResponse(
        UUID id,
        String name,
        Integer priceMonthly,
        Integer priceYearly,
        Integer maxUsers,
        Integer maxStorageGb,
        Map<String, Object> features,
        String description,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
