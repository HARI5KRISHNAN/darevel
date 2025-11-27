package com.darevel.dashboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WebClient.Builder webClientBuilder;

    @Value("${services.chat.url}")
    private String chatServiceUrl;

    @Value("${services.chat.health-endpoint}")
    private String chatHealthEndpoint;

    @Value("${services.mail.url}")
    private String mailServiceUrl;

    @Value("${services.mail.health-endpoint}")
    private String mailHealthEndpoint;

    @Value("${services.sheet.url}")
    private String sheetServiceUrl;

    @Value("${services.sheet.health-endpoint}")
    private String sheetHealthEndpoint;

    @Value("${services.slides.url}")
    private String slidesServiceUrl;

    @Value("${services.slides.health-endpoint}")
    private String slidesHealthEndpoint;

    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();

        int appsOnline = checkServicesStatus();
        overview.put("appsOnline", appsOnline);
        overview.put("totalApps", 4);
        overview.put("lastUpdated", LocalDateTime.now());

        return overview;
    }

    public Map<String, Object> getAppsStatus() {
        Map<String, Object> status = new HashMap<>();

        status.put("chat", checkServiceHealth(chatServiceUrl, chatHealthEndpoint));
        status.put("mail", checkServiceHealth(mailServiceUrl, mailHealthEndpoint));
        status.put("sheet", checkServiceHealth(sheetServiceUrl, sheetHealthEndpoint));
        status.put("slides", checkServiceHealth(slidesServiceUrl, slidesHealthEndpoint));

        return status;
    }

    private int checkServicesStatus() {
        int count = 0;

        if (isServiceHealthy(chatServiceUrl, chatHealthEndpoint)) count++;
        if (isServiceHealthy(mailServiceUrl, mailHealthEndpoint)) count++;
        if (isServiceHealthy(sheetServiceUrl, sheetHealthEndpoint)) count++;
        if (isServiceHealthy(slidesServiceUrl, slidesHealthEndpoint)) count++;

        return count;
    }

    private Map<String, Object> checkServiceHealth(String baseUrl, String healthEndpoint) {
        Map<String, Object> healthStatus = new HashMap<>();
        healthStatus.put("url", baseUrl);
        healthStatus.put("status", isServiceHealthy(baseUrl, healthEndpoint) ? "online" : "offline");
        return healthStatus;
    }

    private boolean isServiceHealthy(String baseUrl, String healthEndpoint) {
        try {
            WebClient webClient = webClientBuilder.build();

            String response = webClient.get()
                    .uri(baseUrl + healthEndpoint)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(2))
                    .onErrorResume(e -> Mono.just(""))
                    .block();

            return response != null && !response.isEmpty();
        } catch (Exception e) {
            log.debug("Service at {} is not healthy: {}", baseUrl, e.getMessage());
            return false;
        }
    }
}
