package com.darevel.workflow.trigger.service;

import com.darevel.workflow.shared.events.TriggerEvent;
import com.darevel.workflow.shared.messaging.KafkaTopics;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TriggerPublisher {

    private final KafkaTemplate<String, TriggerEvent> kafkaTemplate;

    public TriggerEvent publish(TriggerEvent event) {
        TriggerEvent payload = event.toBuilder()
                .id(event.getId() == null ? UUID.randomUUID() : event.getId())
                .receivedAt(event.getReceivedAt() == null ? Instant.now() : event.getReceivedAt())
                .build();
        kafkaTemplate.send(KafkaTopics.WORKFLOW_TRIGGERS, payload.getId().toString(), payload);
        return payload;
    }
}
