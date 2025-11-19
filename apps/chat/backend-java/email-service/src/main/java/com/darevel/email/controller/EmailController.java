package com.darevel.email.controller;

import com.darevel.email.dto.EmailRequest;
import com.darevel.email.dto.EmailResponse;
import com.darevel.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmailController {

    private final EmailService emailService;

    /**
     * Send email
     * POST /api/email/send
     */
    @PostMapping("/send")
    public ResponseEntity<EmailResponse> sendEmail(@RequestBody EmailRequest request) {
        try {
            log.info("Send email request received for: {}", request.getTo());
            EmailResponse response = emailService.sendEmail(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending email", e);
            EmailResponse errorResponse = EmailResponse.builder()
                    .success(false)
                    .error("Failed to send email: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Send incident notification
     * POST /api/email/send-incident
     */
    @PostMapping("/send-incident")
    public ResponseEntity<EmailResponse> sendIncident(@RequestBody Map<String, String> data) {
        try {
            log.info("Send incident email request received");
            EmailResponse response = emailService.sendIncidentNotification(data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending incident email", e);
            EmailResponse errorResponse = EmailResponse.builder()
                    .success(false)
                    .error("Failed to send incident email: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Send analytics report
     * POST /api/email/send-analytics
     */
    @PostMapping("/send-analytics")
    public ResponseEntity<EmailResponse> sendAnalytics(@RequestBody Map<String, Object> data) {
        try {
            log.info("Send analytics email request received");
            EmailResponse response = emailService.sendAnalyticsReport(data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending analytics email", e);
            EmailResponse errorResponse = EmailResponse.builder()
                    .success(false)
                    .error("Failed to send analytics email: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Send summary email
     * POST /api/email/send-summary
     */
    @PostMapping("/send-summary")
    public ResponseEntity<EmailResponse> sendSummary(@RequestBody Map<String, String> data) {
        try {
            log.info("Send summary email request received");
            EmailResponse response = emailService.sendSummary(data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error sending summary email", e);
            EmailResponse errorResponse = EmailResponse.builder()
                    .success(false)
                    .error("Failed to send summary email: " + e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Suggest email subjects (for compatibility)
     * POST /api/email/suggest-subjects
     */
    @PostMapping("/suggest-subjects")
    public ResponseEntity<Map<String, Object>> suggestSubjects(@RequestBody Map<String, String> data) {
        try {
            String category = data.getOrDefault("category", "general");
            List<String> suggestions = new ArrayList<>();

            switch (category.toLowerCase()) {
                case "incident" -> suggestions.addAll(List.of(
                        "Critical System Incident - Immediate Action Required",
                        "Infrastructure Alert - Service Degradation Detected",
                        "Urgent: Production Environment Issue"
                ));
                case "analytics" -> suggestions.addAll(List.of(
                        "Weekly Analytics Report",
                        "Monthly Performance Summary",
                        "System Metrics and Insights"
                ));
                case "summary" -> suggestions.addAll(List.of(
                        "Meeting Summary - Key Takeaways",
                        "Project Status Update",
                        "Daily Standup Notes"
                ));
                default -> suggestions.addAll(List.of(
                        "Notification from Darevel",
                        "System Update",
                        "Important Information"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("suggestions", suggestions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error suggesting subjects", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
