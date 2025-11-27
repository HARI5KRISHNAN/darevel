package com.darevel.ai.service;

import com.darevel.ai.config.OllamaConfig;
import com.darevel.ai.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OllamaService {

    private final WebClient ollamaWebClient;
    private final OllamaConfig config;

    /**
     * Generate AI response using Ollama
     */
    public AIResponse generateResponse(AIRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            // Build Ollama request
            OllamaRequest ollamaRequest = OllamaRequest.builder()
                    .model(request.getModel() != null ? request.getModel() : config.getDefaultModel())
                    .prompt(request.getPrompt())
                    .stream(false)
                    .temperature(request.getTemperature() != null ? request.getTemperature() : config.getDefaultTemperature())
                    .num_predict(request.getMaxTokens() != null ? request.getMaxTokens() : config.getDefaultMaxTokens())
                    .build();

            log.info("Sending request to Ollama: model={}, prompt length={}",
                    ollamaRequest.getModel(), request.getPrompt().length());

            // Call Ollama API
            OllamaResponse ollamaResponse = ollamaWebClient.post()
                    .uri("/api/generate")
                    .bodyValue(ollamaRequest)
                    .retrieve()
                    .bodyToMono(OllamaResponse.class)
                    .timeout(Duration.ofSeconds(config.getTimeoutSeconds()))
                    .block();

            long processingTime = System.currentTimeMillis() - startTime;

            if (ollamaResponse != null && ollamaResponse.getResponse() != null) {
                log.info("Received response from Ollama: {} tokens in {}ms",
                        ollamaResponse.getEval_count(), processingTime);

                return AIResponse.builder()
                        .response(ollamaResponse.getResponse())
                        .model(ollamaResponse.getModel())
                        .tokensUsed(ollamaResponse.getEval_count() != null ?
                                ollamaResponse.getEval_count().intValue() : 0)
                        .processingTimeMs(processingTime)
                        .success(true)
                        .build();
            } else {
                return AIResponse.builder()
                        .success(false)
                        .error("Empty response from Ollama")
                        .processingTimeMs(processingTime)
                        .build();
            }

        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Error calling Ollama API", e);

            return AIResponse.builder()
                    .success(false)
                    .error("Failed to generate response: " + e.getMessage())
                    .processingTimeMs(processingTime)
                    .build();
        }
    }

    /**
     * Analyze alert and generate insights
     */
    public AIResponse analyzeAlert(String alertName, String severity, String description) {
        String prompt = String.format(
                "Analyze this Kubernetes alert and provide insights:\n\n" +
                "Alert Name: %s\n" +
                "Severity: %s\n" +
                "Description: %s\n\n" +
                "Provide:\n" +
                "1. Root cause analysis\n" +
                "2. Recommended actions\n" +
                "3. Prevention strategies\n\n" +
                "Be concise and actionable.",
                alertName, severity, description
        );

        AIRequest request = AIRequest.builder()
                .prompt(prompt)
                .temperature(0.5)
                .maxTokens(1000)
                .build();

        return generateResponse(request);
    }

    /**
     * Analyze incident and suggest resolution
     */
    public AIResponse analyzeIncident(String title, String category, String severity, String description) {
        String prompt = String.format(
                "Analyze this Kubernetes incident and suggest resolution:\n\n" +
                "Title: %s\n" +
                "Category: %s\n" +
                "Severity: %s\n" +
                "Description: %s\n\n" +
                "Provide:\n" +
                "1. Impact assessment\n" +
                "2. Step-by-step resolution guide\n" +
                "3. Root cause hypothesis\n" +
                "4. Post-incident actions\n\n" +
                "Be specific and technical.",
                title, category, severity, description
        );

        AIRequest request = AIRequest.builder()
                .prompt(prompt)
                .temperature(0.5)
                .maxTokens(1500)
                .build();

        return generateResponse(request);
    }

    /**
     * Generate meeting summary
     */
    public AIResponse generateSummary(String content) {
        String prompt = String.format(
                "Summarize this meeting transcript or conversation:\n\n%s\n\n" +
                "Provide:\n" +
                "1. Key discussion points\n" +
                "2. Decisions made\n" +
                "3. Action items\n" +
                "4. Follow-up needed\n\n" +
                "Be clear and organized.",
                content
        );

        AIRequest request = AIRequest.builder()
                .prompt(prompt)
                .temperature(0.3)
                .maxTokens(1000)
                .build();

        return generateResponse(request);
    }

    /**
     * Check if Ollama is available
     */
    public boolean isAvailable() {
        try {
            ollamaWebClient.get()
                    .uri("/api/tags")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            return true;
        } catch (Exception e) {
            log.warn("Ollama is not available: {}", e.getMessage());
            return false;
        }
    }
}
