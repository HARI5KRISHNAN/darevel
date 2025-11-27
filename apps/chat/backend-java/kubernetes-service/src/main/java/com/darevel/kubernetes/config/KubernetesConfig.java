package com.darevel.kubernetes.config;

import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.util.Config;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class KubernetesConfig {

    @Bean
    public ApiClient apiClient() {
        try {
            // Try to use in-cluster configuration first
            ApiClient client = Config.defaultClient();
            client.setHttpClient(
                client.getHttpClient().newBuilder()
                    .readTimeout(java.time.Duration.ofSeconds(60))
                    .build()
            );
            log.info("Kubernetes API client configured successfully");
            return client;
        } catch (Exception e) {
            log.error("Failed to configure Kubernetes API client", e);
            throw new RuntimeException("Failed to configure Kubernetes API client", e);
        }
    }

    @Bean
    public CoreV1Api coreV1Api(ApiClient apiClient) {
        return new CoreV1Api(apiClient);
    }
}
