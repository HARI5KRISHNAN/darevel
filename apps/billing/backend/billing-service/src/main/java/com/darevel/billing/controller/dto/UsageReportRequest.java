package com.darevel.billing.controller.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record UsageReportRequest(
        @NotNull UUID orgId,
        @Min(0) Integer usersCount,
        @DecimalMin(value = "0.0", inclusive = true) Double storageUsedGb,
        @Min(0) Integer docsCount,
        @Min(0) Integer filesCount,
        @Min(0) Integer emailsSent,
        LocalDate recordedAt) {}
