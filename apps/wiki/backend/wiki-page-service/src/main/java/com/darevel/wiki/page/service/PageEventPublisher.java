package com.darevel.wiki.page.service;

import com.darevel.wiki.page.config.KafkaConfig;
import com.darevel.wiki.page.event.PageEvent;
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
public class PageEventPublisher {

    private final ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider;
    private final ObjectMapper objectMapper;

    public void publish(PageEvent event) {
        KafkaTemplate<String, String> kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
        if (kafkaTemplate == null) {
            log.debug("KafkaTemplate unavailable; skipping page event {}", event.type());
            return;
        }

        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(KafkaConfig.PAGE_EVENTS_TOPIC, event.pageId().toString(), payload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize page event {}", event.type(), e);
        }
    }
}
