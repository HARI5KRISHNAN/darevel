package com.darevel.billing.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record WebhookEventRequest(
        @NotBlank String provider,
        @NotBlank String eventType,
        @NotNull Map<String, Object> payload,
        String signature) {}
