package com.darevel.billing.controller.dto;

import com.darevel.billing.model.enums.InvoiceStatus;
import java.time.OffsetDateTime;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        UUID subscriptionId,
        UUID orgId,
        Integer amount,
        String currency,
        InvoiceStatus status,
        String invoicePdfUrl,
        OffsetDateTime billingPeriodStart,
        OffsetDateTime billingPeriodEnd,
        OffsetDateTime createdAt) {}
