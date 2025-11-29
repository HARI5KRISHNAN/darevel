package com.darevel.wiki.page.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    public static final String PAGE_EVENTS_TOPIC = "wiki.page.events";

    @Bean
    @ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
    public NewTopic pageEventsTopic() {
        return new NewTopic(PAGE_EVENTS_TOPIC, 3, (short) 1);
    }
}
