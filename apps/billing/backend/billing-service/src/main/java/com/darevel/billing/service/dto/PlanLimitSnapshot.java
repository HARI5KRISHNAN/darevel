package com.darevel.billing.service.dto;

import java.util.Map;

public record PlanLimitSnapshot(
        Integer maxUsers,
        Integer usedUsers,
        Double maxStorageGb,
        Double usedStorageGb,
        Map<String, Boolean> features) {}
