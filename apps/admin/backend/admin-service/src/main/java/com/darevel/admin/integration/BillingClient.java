package com.darevel.admin.integration;

import com.darevel.admin.config.AdminProperties;
import com.darevel.admin.dto.BillingSummaryResponse;
import com.darevel.admin.exception.RemoteServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Component
public class BillingClient {

    private static final Logger log = LoggerFactory.getLogger(BillingClient.class);

    private final RestTemplate restTemplate;
    private final AdminProperties properties;

    public BillingClient(RestTemplate restTemplate, AdminProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public BillingSummaryResponse fetchSummary(UUID orgId) {
        String baseUrl = properties.getIntegrations().getBillingBaseUrl();
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/api/billing/subscriptions/{orgId}")
            .build(orgId);
        try {
            ResponseEntity<BillingResponse> response = restTemplate.getForEntity(url, BillingResponse.class);
            BillingResponse body = response.getBody();
            if (body == null) {
                throw new RemoteServiceException("billing-service", "Empty response while fetching billing summary");
            }
            return new BillingSummaryResponse(
                orgId,
                body.plan(),
                body.status(),
                body.renewalDate(),
                body.seatsUsed(),
                body.seatsTotal()
            );
        } catch (RestClientException ex) {
            log.warn("Failed to call billing-service: {}", ex.getMessage());
            throw new RemoteServiceException("billing-service", "Unable to fetch billing summary", ex);
        }
    }

    public record BillingResponse(String plan, String status, LocalDate renewalDate, int seatsUsed, int seatsTotal, Map<String, Object> metadata) {}
}
