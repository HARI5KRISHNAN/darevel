package com.darevel.drive.meta.service;

import com.darevel.drive.meta.config.KafkaConfig;
import com.darevel.drive.meta.event.NodeEvent;
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
public class NodeEventPublisher {

    private final ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider;
    private final ObjectMapper objectMapper;

    public void publish(NodeEvent event) {
        KafkaTemplate<String, String> template = kafkaTemplateProvider.getIfAvailable();
        if (template == null) {
            log.debug("KafkaTemplate unavailable; skipping node event {}", event.type());
            return;
        }
        try {
            String payload = objectMapper.writeValueAsString(event);
            template.send(KafkaConfig.DRIVE_NODE_EVENTS, event.nodeId().toString(), payload);
        } catch (JsonProcessingException e) {
            log.error("Unable to serialize node event {}", event.type(), e);
        }
    }
}
