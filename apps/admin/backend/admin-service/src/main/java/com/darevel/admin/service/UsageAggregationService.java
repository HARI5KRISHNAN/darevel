package com.darevel.admin.service;

import com.darevel.admin.config.AdminProperties;
import com.darevel.admin.dto.BillingSummaryResponse;
import com.darevel.admin.dto.UsageActivityResponse;
import com.darevel.admin.dto.UsageSummaryResponse;
import com.darevel.admin.integration.BillingClient;
import com.darevel.admin.integration.UsageMetricsClient;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UsageAggregationService {

    private final UsageMetricsClient usageMetricsClient;
    private final BillingClient billingClient;
    private final long ttlMillis;

    private final Map<UUID, CachedUsage> usageCache = new ConcurrentHashMap<>();

    public UsageAggregationService(UsageMetricsClient usageMetricsClient, BillingClient billingClient, AdminProperties properties) {
        this.usageMetricsClient = usageMetricsClient;
        this.billingClient = billingClient;
        this.ttlMillis = properties.getCaching().getTtlSeconds() * 1000;
    }

    public UsageSummaryResponse getUsageSummary(UUID orgId) {
        CachedUsage cached = usageCache.get(orgId);
        if (cached != null && cached.isValid(ttlMillis)) {
            return cached.summary();
        }
        UsageSummaryResponse summary = usageMetricsClient.fetchSummary(orgId);
        usageCache.put(orgId, new CachedUsage(summary));
        return summary;
    }

    public UsageActivityResponse getUsageActivity(UUID orgId) {
        return usageMetricsClient.fetchActivity(orgId);
    }

    public BillingSummaryResponse getBillingSummary(UUID orgId) {
        return billingClient.fetchSummary(orgId);
    }

    private record CachedUsage(UsageSummaryResponse summary, long createdAt) {
        private CachedUsage(UsageSummaryResponse summary) {
            this(summary, Instant.now().toEpochMilli());
        }

        private boolean isValid(long ttlMillis) {
            return Instant.now().toEpochMilli() - createdAt < ttlMillis;
        }
    }
}
