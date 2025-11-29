package com.darevel.billing.integration;

import java.util.Map;
import java.util.UUID;

public interface PaymentGatewayClient {

    String createCheckoutSession(UUID orgId, UUID planId, String successUrl, String cancelUrl);

    Map<String, Object> retrieveSubscription(String externalSubscriptionId);
}
