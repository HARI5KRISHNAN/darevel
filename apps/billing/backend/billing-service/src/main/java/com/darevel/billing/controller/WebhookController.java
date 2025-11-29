package com.darevel.billing.controller;

import com.darevel.billing.controller.dto.WebhookEventRequest;
import com.darevel.billing.service.BillingWebhookService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/billing/webhooks")
public class WebhookController {

    private final BillingWebhookService billingWebhookService;

    public WebhookController(BillingWebhookService billingWebhookService) {
        this.billingWebhookService = billingWebhookService;
    }

    @PostMapping(value = "/payment", consumes = "application/json")
    public ResponseEntity<Void> handlePaymentWebhook(
            @Valid @RequestBody WebhookEventRequest request,
            @RequestHeader(value = "Stripe-Signature", required = false) String stripeSignature) {
        WebhookEventRequest enriched = new WebhookEventRequest(
                request.provider(), request.eventType(), request.payload(), stripeSignature);
        billingWebhookService.handle(enriched);
        return ResponseEntity.accepted().build();
    }
}
