package com.darevel.notification.domain.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        UUID orgId,
        UUID userId,
        String source,
        String type,
        String title,
        String body,
        JsonNode metadata,
        boolean read,
        String priority,
        OffsetDateTime createdAt
) {}
