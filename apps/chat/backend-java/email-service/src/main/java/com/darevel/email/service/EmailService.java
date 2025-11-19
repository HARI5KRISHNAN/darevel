package com.darevel.email.service;

import com.darevel.email.dto.EmailRequest;
import com.darevel.email.dto.EmailResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@darevel.com}")
    private String fromEmail;

    /**
     * Send email
     */
    public EmailResponse sendEmail(EmailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());

            if (request.getCc() != null && !request.getCc().isEmpty()) {
                helper.setCc(request.getCc().toArray(new String[0]));
            }

            String body = request.getBody();
            if (request.getTemplate() != null) {
                body = renderTemplate(request.getTemplate(), request.getTemplateData());
            }

            helper.setText(body, request.isHtml());

            mailSender.send(message);
            log.info("Email sent successfully to {}", request.getTo());

            return EmailResponse.builder()
                    .success(true)
                    .message("Email sent successfully")
                    .build();

        } catch (MessagingException e) {
            log.error("Failed to send email", e);
            return EmailResponse.builder()
                    .success(false)
                    .error("Failed to send email: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Send incident notification
     */
    public EmailResponse sendIncidentNotification(Map<String, String> data) {
        String title = data.getOrDefault("title", "Unknown Incident");
        String severity = data.getOrDefault("severity", "medium");
        String description = data.getOrDefault("description", "");
        String to = data.getOrDefault("to", "admin@darevel.com");

        String body = String.format(
                "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #d32f2f;'>🚨 Incident Alert</h2>" +
                "<div style='background-color: #f5f5f5; padding: 15px; border-left: 4px solid #d32f2f;'>" +
                "<h3>%s</h3>" +
                "<p><strong>Severity:</strong> <span style='color: %s;'>%s</span></p>" +
                "<p><strong>Description:</strong> %s</p>" +
                "</div>" +
                "<p style='margin-top: 20px; color: #666;'>This is an automated notification from Darevel Monitoring System.</p>" +
                "</div>" +
                "</body>" +
                "</html>",
                title,
                getSeverityColor(severity),
                severity.toUpperCase(),
                description
        );

        EmailRequest request = EmailRequest.builder()
                .to(to)
                .subject(String.format("[%s] Incident: %s", severity.toUpperCase(), title))
                .body(body)
                .html(true)
                .build();

        return sendEmail(request);
    }

    /**
     * Send analytics report
     */
    public EmailResponse sendAnalyticsReport(Map<String, Object> data) {
        String to = data.getOrDefault("to", "admin@darevel.com").toString();
        String period = data.getOrDefault("period", "Daily").toString();

        String body = String.format(
                "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #1976d2;'>📊 %s Analytics Report</h2>" +
                "<div style='background-color: #e3f2fd; padding: 15px; border-radius: 5px;'>" +
                "<p>Your analytics report is ready.</p>" +
                "<p><strong>Period:</strong> %s</p>" +
                "</div>" +
                "<p style='margin-top: 20px; color: #666;'>View detailed analytics in your dashboard.</p>" +
                "</div>" +
                "</body>" +
                "</html>",
                period,
                period
        );

        EmailRequest request = EmailRequest.builder()
                .to(to)
                .subject(String.format("%s Analytics Report", period))
                .body(body)
                .html(true)
                .build();

        return sendEmail(request);
    }

    /**
     * Send summary email
     */
    public EmailResponse sendSummary(Map<String, String> data) {
        String to = data.getOrDefault("to", "admin@darevel.com");
        String subject = data.getOrDefault("subject", "Summary Report");
        String summary = data.getOrDefault("summary", "");

        String body = String.format(
                "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<h2 style='color: #388e3c;'>📋 %s</h2>" +
                "<div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px;'>" +
                "<pre style='white-space: pre-wrap; font-family: Arial;'>%s</pre>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>",
                subject,
                summary
        );

        EmailRequest request = EmailRequest.builder()
                .to(to)
                .subject(subject)
                .body(body)
                .html(true)
                .build();

        return sendEmail(request);
    }

    private String renderTemplate(String template, Map<String, Object> data) {
        // Simple template rendering - replace placeholders
        String result = template;
        if (data != null) {
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                result = result.replace("{{" + entry.getKey() + "}}", entry.getValue().toString());
            }
        }
        return result;
    }

    private String getSeverityColor(String severity) {
        return switch (severity.toLowerCase()) {
            case "critical" -> "#d32f2f";
            case "high" -> "#f57c00";
            case "medium" -> "#fbc02d";
            case "low" -> "#388e3c";
            default -> "#757575";
        };
    }
}
