package com.darevel.billing.integration;

import com.darevel.billing.config.BillingProperties;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StripePaymentClient implements PaymentGatewayClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(StripePaymentClient.class);

    private final BillingProperties properties;

    @Override
    public String createCheckoutSession(UUID orgId, UUID planId, String successUrl, String cancelUrl) {
        LOGGER.info("Stub checkout session for org {} plan {}", orgId, planId);
        return "stub-session-id";
    }

    @Override
    public Map<String, Object> retrieveSubscription(String externalSubscriptionId) {
        LOGGER.info("Stub subscription retrieval for {}", externalSubscriptionId);
        return Map.of();
    }
}
