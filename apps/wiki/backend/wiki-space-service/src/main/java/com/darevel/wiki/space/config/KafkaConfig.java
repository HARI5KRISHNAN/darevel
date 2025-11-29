package com.darevel.wiki.space.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    public static final String SPACE_EVENTS_TOPIC = "wiki.space.events";

    @Bean
    @ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
    public NewTopic spaceEventsTopic() {
        return new NewTopic(SPACE_EVENTS_TOPIC, 3, (short) 1);
    }
}
