package com.darevel.preview.service;

import com.darevel.preview.config.properties.GeminiProperties;
import com.darevel.preview.dto.PreviewInsightResponse;
import com.google.ai.client.generativeai.GenerativeModel;
import com.google.ai.client.generativeai.type.GenerateContentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class PreviewInsightsService {

    private static final Logger log = LoggerFactory.getLogger(PreviewInsightsService.class);

    private final GeminiProperties properties;

    public PreviewInsightsService(GeminiProperties properties) {
        this.properties = properties;
    }

    public PreviewInsightResponse summarize(String textContent, String filename) {
        if (!properties.isEnabled() || properties.getApiKey() == null) {
            return new PreviewInsightResponse("AI disabled", new String[]{"Enable preview.ai.enabled to activate."});
        }
        try {
            GenerativeModel model = new GenerativeModel(properties.getModel(), properties.getApiKey());
            GenerateContentResponse response = model.generateContent("Summarize " + filename + "\n\n" + textContent);
            String summary = response.getText();
            return new PreviewInsightResponse(summary, new String[]{"Generated via Gemini"});
        } catch (Exception ex) {
            log.warn("Gemini request failed", ex);
            return new PreviewInsightResponse("Unable to generate insights", new String[]{"Gemini call failed"});
        }
    }
}
