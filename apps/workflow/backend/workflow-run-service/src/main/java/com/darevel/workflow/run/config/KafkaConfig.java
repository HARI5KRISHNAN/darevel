package com.darevel.workflow.run.config;

import com.darevel.workflow.shared.dto.WorkflowRunDto;
import java.util.HashMap;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

@Configuration
@EnableConfigurationProperties
public class KafkaConfig {

    @Bean
    public ConsumerFactory<String, WorkflowRunDto> workflowRunConsumerFactory(
            org.springframework.boot.autoconfigure.kafka.KafkaProperties properties) {
        Map<String, Object> props = new HashMap<>(properties.buildConsumerProperties());
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        JsonDeserializer<WorkflowRunDto> valueDeserializer = new JsonDeserializer<>(WorkflowRunDto.class);
        valueDeserializer.addTrustedPackages("com.darevel.workflow.*");
        return new DefaultKafkaConsumerFactory<>(props, new StringDeserializer(), valueDeserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, WorkflowRunDto> workflowRunListenerFactory(
            ConsumerFactory<String, WorkflowRunDto> workflowRunConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, WorkflowRunDto> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(workflowRunConsumerFactory);
        return factory;
    }
}
