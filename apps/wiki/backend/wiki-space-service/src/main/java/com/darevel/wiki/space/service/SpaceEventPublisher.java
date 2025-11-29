package com.darevel.wiki.space.service;

import com.darevel.wiki.space.config.KafkaConfig;
import com.darevel.wiki.space.event.SpaceEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SpaceEventPublisher {

    private final ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider;
    private final ObjectMapper objectMapper;

    public void publish(SpaceEvent event) {
        KafkaTemplate<String, String> kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
        if (kafkaTemplate == null) {
            log.debug("KafkaTemplate unavailable; skipping event {}", event.type());
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(KafkaConfig.SPACE_EVENTS_TOPIC, event.spaceId().toString(), payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize space event {}", event.type(), e);
        }
    }
}
