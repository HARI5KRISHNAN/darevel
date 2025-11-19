package com.darevel.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Data
@Configuration
@ConfigurationProperties(prefix = "ollama")
public class OllamaConfig {

    private String baseUrl = "http://localhost:11434";
    private String defaultModel = "llama2";
    private Double defaultTemperature = 0.7;
    private Integer defaultMaxTokens = 2000;
    private Integer timeoutSeconds = 60;

    @Bean
    public WebClient ollamaWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
