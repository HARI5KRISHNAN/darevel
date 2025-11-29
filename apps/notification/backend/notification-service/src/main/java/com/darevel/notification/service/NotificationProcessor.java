package com.darevel.notification.service;

import com.darevel.notification.messaging.NotificationEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class NotificationProcessor {

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService;

    public NotificationProcessor(ObjectMapper objectMapper, NotificationService notificationService) {
        this.objectMapper = objectMapper;
        this.notificationService = notificationService;
    }

    public void handleRawPayload(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            NotificationEvent event = new NotificationEvent(
                    UUID.fromString(node.path("orgId").asText()),
                    UUID.fromString(node.path("userId").asText()),
                    node.path("source").asText(),
                    node.path("type").asText(),
                    node.path("title").asText(),
                    node.path("body").asText(),
                    node.path("metadata"),
                    node.path("priority").asText("normal").equalsIgnoreCase("high"),
                    node.hasNonNull("createdAt") ? OffsetDateTime.parse(node.get("createdAt").asText()) : OffsetDateTime.now()
            );
            notificationService.ingest(event);
        } catch (IOException | IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unable to parse notification payload", ex);
        }
    }
}
