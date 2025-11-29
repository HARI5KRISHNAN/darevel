package com.darevel.wiki.content.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    public static final String CONTENT_EVENTS_TOPIC = "wiki.content.events";

    @Bean
    @ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
    public NewTopic contentEventsTopic() {
        return new NewTopic(CONTENT_EVENTS_TOPIC, 3, (short) 1);
    }
}
