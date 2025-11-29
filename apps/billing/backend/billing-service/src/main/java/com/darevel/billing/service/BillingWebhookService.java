package com.darevel.billing.service;

import com.darevel.billing.config.BillingProperties;
import com.darevel.billing.controller.dto.WebhookEventRequest;
import com.darevel.billing.model.enums.InvoiceStatus;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BillingWebhookService {

    private final BillingProperties properties;
    private final SubscriptionService subscriptionService;
    private final InvoiceService invoiceService;

    public void handle(WebhookEventRequest request) {
        if (!properties.getWebhook().getAllowedEvents().contains(request.eventType())) {
            return; // ignore noisy events
        }
        switch (request.eventType()) {
            case "invoice.paid" -> handleInvoicePaid(request.payload());
            case "invoice.payment_failed" -> handleInvoiceFailed(request.payload());
            case "subscription.updated" -> handleSubscriptionUpdated(request.payload());
            case "subscription.deleted" -> handleSubscriptionDeleted(request.payload());
            default -> {
                // noop
            }
        }
    }

    private void handleInvoicePaid(Map<String, Object> payload) {
        UUID orgId = extractUuid(payload.get("orgId"));
        OffsetDateTime periodStart = toOffsetDateTime(payload.get("billingPeriodStart"));
        OffsetDateTime periodEnd = toOffsetDateTime(payload.get("billingPeriodEnd"));
        Integer amount = extractInteger(payload.get("amount"));
        String pdfUrl = valueAsString(payload.get("invoicePdfUrl"));
        if (orgId != null) {
            invoiceService.recordInvoice(orgId, amount, InvoiceStatus.PAID, periodStart, periodEnd, pdfUrl);
        }
        subscriptionService.markInvoicePaid(valueAsString(payload.get("externalSubscriptionId")));
    }

    private void handleInvoiceFailed(Map<String, Object> payload) {
        subscriptionService.markInvoiceFailed(valueAsString(payload.get("externalSubscriptionId")));
    }

    private void handleSubscriptionUpdated(Map<String, Object> payload) {
        // For now we only ensure cancel flag resets when provider notifies us
        String status = valueAsString(payload.get("status"));
        if ("active".equalsIgnoreCase(status)) {
            subscriptionService.markInvoicePaid(valueAsString(payload.get("externalSubscriptionId")));
        } else if ("past_due".equalsIgnoreCase(status)) {
            subscriptionService.markInvoiceFailed(valueAsString(payload.get("externalSubscriptionId")));
        }
    }

    private void handleSubscriptionDeleted(Map<String, Object> payload) {
        subscriptionService.markCancelled(valueAsString(payload.get("externalSubscriptionId")));
    }

    private UUID extractUuid(Object value) {
        return value instanceof UUID uuid ? uuid : value != null ? UUID.fromString(value.toString()) : null;
    }

    private OffsetDateTime toOffsetDateTime(Object value) {
        return value == null ? null : OffsetDateTime.parse(value.toString());
    }

    private Integer extractInteger(Object value) {
        if (value instanceof Integer i) {
            return i;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        return value != null ? Integer.parseInt(value.toString()) : null;
    }

    private String valueAsString(Object value) {
        return value == null ? null : value.toString();
    }
}
