package com.darevel.admin.integration;

import com.darevel.admin.config.AdminProperties;
import com.darevel.admin.dto.ActivityLogEntry;
import com.darevel.admin.exception.RemoteServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
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
public class AuditClient {

    private static final Logger log = LoggerFactory.getLogger(AuditClient.class);

    private final RestTemplate restTemplate;
    private final AdminProperties properties;

    public AuditClient(RestTemplate restTemplate, AdminProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public List<ActivityLogEntry> fetchRecentActivity(UUID orgId, int limit) {
        String baseUrl = properties.getIntegrations().getAuditBaseUrl();
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/api/audit/logs/recent")
            .queryParam("orgId", orgId)
            .queryParam("limit", limit)
            .build()
            .toString();
        try {
            ResponseEntity<ActivityResponse[]> response = restTemplate.getForEntity(url, ActivityResponse[].class);
            ActivityResponse[] body = response.getBody();
            if (body == null) {
                return Collections.emptyList();
            }
            return Arrays.stream(body)
                .map(item -> new ActivityLogEntry(item.timestamp(), item.userName(), item.action(), item.resourceType(), item.resourceName()))
                .toList();
        } catch (RestClientException ex) {
            log.warn("Failed to fetch audit timeline: {}", ex.getMessage());
            throw new RemoteServiceException("audit-service", "Unable to fetch recent activity", ex);
        }
    }

    public void publishAdminEvent(AdminAuditPayload payload) {
        String baseUrl = properties.getIntegrations().getAuditBaseUrl();
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/api/audit/logs/admin")
            .build()
            .toString();
        try {
            HttpEntity<AdminAuditPayload> entity = new HttpEntity<>(payload);
            restTemplate.postForEntity(url, entity, Void.class);
        } catch (RestClientException ex) {
            log.warn("Unable to publish admin audit event: {}", ex.getMessage());
        }
    }

    public record AdminAuditPayload(UUID orgId, UUID adminUserId, String action, String targetType, UUID targetId, OffsetDateTime timestamp) {}

    private record ActivityResponse(OffsetDateTime timestamp, String userName, String action, String resourceType, String resourceName) {}
}
