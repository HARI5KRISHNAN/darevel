package com.darevel.billing.controller.dto;

import java.time.LocalDate;
import java.util.UUID;

public record UsageResponse(
        UUID id,
        UUID orgId,
        Integer usersCount,
        Double storageUsedGb,
        Integer docsCount,
        Integer filesCount,
        Integer emailsSent,
        LocalDate recordedAt) {}
