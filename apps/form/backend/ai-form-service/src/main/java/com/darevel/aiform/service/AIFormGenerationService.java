package com.darevel.aiform.service;

import com.darevel.aiform.dto.FormGenerationRequest;
import com.darevel.aiform.dto.FormGenerationResponse;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIFormGenerationService {

    private final WebClient.Builder webClientBuilder;
    private final Gson gson = new Gson();

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    public Mono<FormGenerationResponse> generateForm(FormGenerationRequest request) {
        log.info("Generating form with AI for prompt: {}", request.getPrompt());

        String systemPrompt = """
            You are a form generation assistant. Generate a form structure based on the user's request.
            Return ONLY valid JSON with this exact structure (no markdown, no explanations):
            {
              "title": "Form Title",
              "description": "Form Description",
              "fields": [
                {
                  "label": "Field Label",
                  "type": "text|email|number|select|checkbox|textarea|date",
                  "description": "Field description",
                  "required": true,
                  "config": {"placeholder": "example", "options": ["opt1", "opt2"]}
                }
              ]
            }
            """;

        String userPrompt = String.format(
                "Create a %s form for: %s. Maximum %d fields.",
                request.getFormType() != null ? request.getFormType() : "general",
                request.getPrompt(),
                request.getMaxFields()
        );

        JsonObject requestBody = new JsonObject();
        JsonObject contents = new JsonObject();
        JsonObject parts = new JsonObject();
        parts.addProperty("text", systemPrompt + "\n\n" + userPrompt);
        
        requestBody.add("contents", gson.toJsonTree(new Object[]{
                new Object(){
                    public Object parts = new Object[]{new Object(){
                        public String text = systemPrompt + "\n\n" + userPrompt;
                    }};
                }
        }));

        return webClientBuilder.build()
                .post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody.toString())
                .retrieve()
                .bodyToMono(String.class)
                .map(this::parseGeminiResponse)
                .doOnError(e -> log.error("Error calling Gemini API: {}", e.getMessage()));
    }

    private FormGenerationResponse parseGeminiResponse(String response) {
        try {
            JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
            String generatedText = jsonResponse
                    .getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();

            // Clean markdown code blocks if present
            generatedText = generatedText.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();
            
            return gson.fromJson(generatedText, FormGenerationResponse.class);
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    public Mono<String[]> generateQuestionSuggestions(String context) {
        log.info("Generating question suggestions for context: {}", context);

        String prompt = String.format(
                "Suggest 5 relevant form questions for: %s. Return only a JSON array of strings.",
                context
        );

        JsonObject requestBody = new JsonObject();
        requestBody.add("contents", gson.toJsonTree(new Object[]{
                new Object(){
                    public Object parts = new Object[]{new Object(){
                        public String text = prompt;
                    }};
                }
        }));

        return webClientBuilder.build()
                .post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody.toString())
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    JsonObject jsonResponse = gson.fromJson(response, JsonObject.class);
                    String generatedText = jsonResponse
                            .getAsJsonArray("candidates")
                            .get(0).getAsJsonObject()
                            .getAsJsonObject("content")
                            .getAsJsonArray("parts")
                            .get(0).getAsJsonObject()
                            .get("text").getAsString();
                    
                    generatedText = generatedText.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();
                    return gson.fromJson(generatedText, String[].class);
                })
                .doOnError(e -> log.error("Error generating suggestions: {}", e.getMessage()));
    }
}
