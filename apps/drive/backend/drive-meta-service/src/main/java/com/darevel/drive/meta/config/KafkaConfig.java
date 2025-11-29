package com.darevel.drive.meta.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {

    public static final String DRIVE_NODE_EVENTS = "drive.node.events";

    @Bean
    @ConditionalOnProperty(prefix = "spring.kafka", name = "bootstrap-servers")
    public NewTopic nodeEventsTopic() {
        return new NewTopic(DRIVE_NODE_EVENTS, 3, (short) 1);
    }
}
