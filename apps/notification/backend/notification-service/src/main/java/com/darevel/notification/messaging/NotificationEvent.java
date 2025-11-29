package com.darevel.notification.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationEvent(
        UUID orgId,
        UUID userId,
        String source,
        String type,
        String title,
        String body,
        JsonNode metadata,
        boolean highPriority,
        OffsetDateTime createdAt
) {}
