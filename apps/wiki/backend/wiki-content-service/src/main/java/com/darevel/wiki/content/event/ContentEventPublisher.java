package com.darevel.wiki.content.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes content events to Kafka
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ContentEventPublisher {

    private static final String TOPIC = "wiki.content.events";
    private static final String WS_DESTINATION_PREFIX = "/topic/wiki/content/";

    private final KafkaTemplate<String, ContentEvent> kafkaTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public void publish(ContentEvent event) {
        publishToKafka(event);
        publishToWebSocket(event);
    }

    private void publishToKafka(ContentEvent event) {
        try {
            kafkaTemplate.send(TOPIC, event.pageId().toString(), event);
            log.info("Published event: {} for page: {}", event.eventType(), event.pageId());
        } catch (Exception e) {
            log.error("Failed to publish event: {} for page: {}", event.eventType(), event.pageId(), e);
            // Don't fail the operation if event publishing fails
        }
    }

    private void publishToWebSocket(ContentEvent event) {
        try {
            messagingTemplate.convertAndSend(WS_DESTINATION_PREFIX + event.pageId(), event);
            log.info("Broadcasted event over WebSocket: {} for page: {}", event.eventType(), event.pageId());
        } catch (Exception e) {
            log.error("Failed to broadcast event over WebSocket: {} for page: {}", event.eventType(), event.pageId(), e);
        }
    }
}
