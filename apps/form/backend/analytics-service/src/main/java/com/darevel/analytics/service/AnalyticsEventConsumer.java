package com.darevel.analytics.service;

import com.darevel.analytics.model.FormAnalytics;
import com.darevel.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsEventConsumer {

    private final AnalyticsRepository analyticsRepository;

    @KafkaListener(topics = "form.submission.created", groupId = "analytics-service")
    public void handleSubmissionCreated(Map<String, Object> event) {
        try {
            String formId = (String) event.get("formId");
            log.info("Processing submission event for form: {}", formId);
            
            FormAnalytics analytics = new FormAnalytics();
            analytics.setFormId(formId);
            analytics.setSubmissionDate(LocalDateTime.now());
            analytics.setTotalSubmissions(1L);
            
            analyticsRepository.save(analytics);
            log.info("Analytics saved for form: {}", formId);
        } catch (Exception e) {
            log.error("Error processing submission event: {}", e.getMessage());
        }
    }
}
