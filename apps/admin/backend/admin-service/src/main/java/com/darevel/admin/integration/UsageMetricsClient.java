package com.darevel.admin.integration;

import com.darevel.admin.config.AdminProperties;
import com.darevel.admin.dto.UsageActivityResponse;
import com.darevel.admin.dto.UsageSummaryResponse;
import com.darevel.admin.exception.RemoteServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class UsageMetricsClient {

    private static final Logger log = LoggerFactory.getLogger(UsageMetricsClient.class);

    private final RestTemplate restTemplate;
    private final AdminProperties properties;

    public UsageMetricsClient(RestTemplate restTemplate, AdminProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public UsageSummaryResponse fetchSummary(UUID orgId) {
        String baseUrl = properties.getIntegrations().getUsageBaseUrl();
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/api/usage/summary")
            .queryParam("orgId", orgId)
            .build()
            .toString();
        try {
            ResponseEntity<UsageSummaryPayload> response = restTemplate.getForEntity(url, UsageSummaryPayload.class);
            UsageSummaryPayload payload = response.getBody();
            if (payload == null) {
                throw new RemoteServiceException("usage-service", "Empty usage response");
            }
            List<UsageSummaryResponse.TopAppMetric> apps = payload.topApps() == null ? Collections.emptyList() :
                Arrays.stream(payload.topApps())
                    .map(item -> new UsageSummaryResponse.TopAppMetric(item.app(), item.events()))
                    .toList();
            return new UsageSummaryResponse(
                orgId,
                payload.userCount(),
                payload.activeUsersLast7Days(),
                payload.storageUsedGb(),
                payload.storageLimitGb(),
                payload.docsCount(),
                payload.filesCount(),
                payload.mailSentLast7Days(),
                apps,
                payload.generatedAt() == null ? OffsetDateTime.now() : payload.generatedAt()
            );
        } catch (RestClientException ex) {
            log.warn("Failed to fetch usage summary: {}", ex.getMessage());
            throw new RemoteServiceException("usage-service", "Unable to fetch usage summary", ex);
        }
    }

    public UsageActivityResponse fetchActivity(UUID orgId) {
        String baseUrl = properties.getIntegrations().getUsageBaseUrl();
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/api/usage/activity")
            .queryParam("orgId", orgId)
            .build()
            .toString();
        try {
            ResponseEntity<ActivityPayload> response = restTemplate.getForEntity(url, ActivityPayload.class);
            ActivityPayload payload = response.getBody();
            if (payload == null || payload.buckets() == null) {
                return new UsageActivityResponse(orgId, Collections.emptyList());
            }
            List<UsageActivityResponse.ActivityBucket> buckets = Arrays.stream(payload.buckets())
                .map(bucket -> new UsageActivityResponse.ActivityBucket(bucket.label(), bucket.events()))
                .toList();
            return new UsageActivityResponse(orgId, buckets);
        } catch (RestClientException ex) {
            log.warn("Failed to fetch usage activity: {}", ex.getMessage());
            throw new RemoteServiceException("usage-service", "Unable to fetch usage activity", ex);
        }
    }

    private record UsageSummaryPayload(long userCount,
                                       long activeUsersLast7Days,
                                       double storageUsedGb,
                                       double storageLimitGb,
                                       long docsCount,
                                       long filesCount,
                                       long mailSentLast7Days,
                                       TopApp[] topApps,
                                       OffsetDateTime generatedAt) {}

    private record TopApp(String app, long events) {}

    private record ActivityPayload(ActivityBucket[] buckets) {}

    private record ActivityBucket(String label, long events) {}
}
