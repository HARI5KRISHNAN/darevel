package com.darevel.ai.controller;

import com.darevel.ai.dto.AIRequest;
import com.darevel.ai.dto.AIResponse;
import com.darevel.ai.service.OllamaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final OllamaService ollamaService;

    /**
     * Generate AI response
     * POST /api/ai/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<AIResponse> generate(@RequestBody AIRequest request) {
        try {
            log.info("Generate AI response request received");
            AIResponse response = ollamaService.generateResponse(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating AI response", e);
            AIResponse errorResponse = AIResponse.builder()
                    .success(false)
                    .error("Failed to generate response: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Analyze alert
     * POST /api/ai/analyze-alert
     */
    @PostMapping("/analyze-alert")
    public ResponseEntity<AIResponse> analyzeAlert(@RequestBody Map<String, String> request) {
        try {
            String alertName = request.getOrDefault("alertName", "Unknown");
            String severity = request.getOrDefault("severity", "warning");
            String description = request.getOrDefault("description", "");

            log.info("Analyzing alert: {}", alertName);
            AIResponse response = ollamaService.analyzeAlert(alertName, severity, description);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error analyzing alert", e);
            AIResponse errorResponse = AIResponse.builder()
                    .success(false)
                    .error("Failed to analyze alert: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Analyze incident
     * POST /api/ai/analyze-incident
     */
    @PostMapping("/analyze-incident")
    public ResponseEntity<AIResponse> analyzeIncident(@RequestBody Map<String, String> request) {
        try {
            String title = request.getOrDefault("title", "Unknown");
            String category = request.getOrDefault("category", "general");
            String severity = request.getOrDefault("severity", "medium");
            String description = request.getOrDefault("description", "");

            log.info("Analyzing incident: {}", title);
            AIResponse response = ollamaService.analyzeIncident(title, category, severity, description);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error analyzing incident", e);
            AIResponse errorResponse = AIResponse.builder()
                    .success(false)
                    .error("Failed to analyze incident: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Generate meeting summary
     * POST /api/ai/generate-summary
     * POST /api/ai/summary (legacy endpoint)
     */
    @PostMapping({"/generate-summary", "/summary"})
    public ResponseEntity<AIResponse> generateSummary(@RequestBody Map<String, String> request) {
        try {
            String content = request.getOrDefault("content", "");
            if (content.isEmpty()) {
                content = request.getOrDefault("transcript", "");
            }

            log.info("Generating summary for content length: {}", content.length());
            AIResponse response = ollamaService.generateSummary(content);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error generating summary", e);
            AIResponse errorResponse = AIResponse.builder()
                    .success(false)
                    .error("Failed to generate summary: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Send summary (legacy endpoint for compatibility)
     * POST /api/ai/send-summary
     */
    @PostMapping("/send-summary")
    public ResponseEntity<Map<String, Object>> sendSummary(@RequestBody Map<String, String> request) {
        try {
            String content = request.getOrDefault("content", "");
            AIResponse aiResponse = ollamaService.generateSummary(content);

            Map<String, Object> response = new HashMap<>();
            response.put("success", aiResponse.isSuccess());
            response.put("summary", aiResponse.getResponse());
            response.put("error", aiResponse.getError());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending summary", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     * GET /api/ai/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        boolean available = ollamaService.isAvailable();

        health.put("status", available ? "UP" : "DOWN");
        health.put("ollamaAvailable", available);
        health.put("service", "ai-service");

        return ResponseEntity.ok(health);
    }
}
