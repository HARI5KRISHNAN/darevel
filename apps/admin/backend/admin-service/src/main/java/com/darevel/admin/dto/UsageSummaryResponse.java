package com.darevel.admin.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UsageSummaryResponse(
    UUID orgId,
    long userCount,
    long activeUsersLast7Days,
    double storageUsedGb,
    double storageLimitGb,
    long docsCount,
    long filesCount,
    long mailSentLast7Days,
    List<TopAppMetric> topApps,
    OffsetDateTime generatedAt
) {
    public record TopAppMetric(String app, long events) {}
}
