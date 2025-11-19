package com.darevel.alerts.service;

import com.darevel.alerts.dto.Alert;
import com.darevel.alerts.dto.PrometheusWebhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AlertsService {

    private static final int MAX_ALERTS = 100;
    private final Map<String, Alert> alerts = new ConcurrentHashMap<>();
    private final DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_DATE_TIME;

    /**
     * Process Prometheus webhook and create alerts
     */
    public List<Alert> processWebhook(PrometheusWebhook webhook) {
        log.info("Processing Prometheus webhook with {} alerts", webhook.getAlerts().size());

        List<Alert> createdAlerts = new ArrayList<>();

        for (PrometheusWebhook.PrometheusAlert prometheusAlert : webhook.getAlerts()) {
            String alertId = UUID.randomUUID().toString();

            Alert alert = Alert.builder()
                    .id(alertId)
                    .status(prometheusAlert.getStatus())
                    .severity(prometheusAlert.getLabels().getOrDefault("severity", "warning"))
                    .alertName(prometheusAlert.getLabels().getOrDefault("alertname", "Unknown"))
                    .summary(prometheusAlert.getAnnotations().getOrDefault("summary", ""))
                    .description(prometheusAlert.getAnnotations().getOrDefault("description", ""))
                    .labels(prometheusAlert.getLabels())
                    .annotations(prometheusAlert.getAnnotations())
                    .startsAt(parseDateTime(prometheusAlert.getStartsAt()))
                    .endsAt(prometheusAlert.getEndsAt() != null ? parseDateTime(prometheusAlert.getEndsAt()) : null)
                    .fingerprint(prometheusAlert.getFingerprint())
                    .generatorURL(prometheusAlert.getGeneratorURL())
                    .acknowledged(false)
                    .build();

            // Maintain max alerts limit (FIFO)
            if (alerts.size() >= MAX_ALERTS) {
                String oldestKey = alerts.keySet().stream()
                        .min(Comparator.comparing(k -> alerts.get(k).getStartsAt()))
                        .orElse(null);
                if (oldestKey != null) {
                    alerts.remove(oldestKey);
                    log.debug("Removed oldest alert to maintain limit of {}", MAX_ALERTS);
                }
            }

            alerts.put(alertId, alert);
            createdAlerts.add(alert);
            log.info("Created alert: {} - {}", alertId, alert.getAlertName());
        }

        return createdAlerts;
    }

    /**
     * Get all alerts
     */
    public List<Alert> getAllAlerts() {
        return new ArrayList<>(alerts.values());
    }

    /**
     * Get alerts by status (firing, resolved)
     */
    public List<Alert> getAlertsByStatus(String status) {
        return alerts.values().stream()
                .filter(alert -> alert.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    /**
     * Get alerts by severity (critical, warning, info)
     */
    public List<Alert> getAlertsBySeverity(String severity) {
        return alerts.values().stream()
                .filter(alert -> alert.getSeverity().equalsIgnoreCase(severity))
                .collect(Collectors.toList());
    }

    /**
     * Get alert by ID
     */
    public Optional<Alert> getAlertById(String id) {
        return Optional.ofNullable(alerts.get(id));
    }

    /**
     * Acknowledge an alert
     */
    public Optional<Alert> acknowledgeAlert(String id, String acknowledgedBy) {
        Alert alert = alerts.get(id);
        if (alert != null) {
            alert.setAcknowledged(true);
            alert.setAcknowledgedAt(LocalDateTime.now());
            alert.setAcknowledgedBy(acknowledgedBy);
            log.info("Alert {} acknowledged by {}", id, acknowledgedBy);
            return Optional.of(alert);
        }
        return Optional.empty();
    }

    /**
     * Delete old resolved alerts (older than specified days)
     */
    public int deleteOldAlerts(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);

        List<String> toRemove = alerts.entrySet().stream()
                .filter(entry -> {
                    Alert alert = entry.getValue();
                    return "resolved".equalsIgnoreCase(alert.getStatus())
                            && alert.getEndsAt() != null
                            && alert.getEndsAt().isBefore(cutoffDate);
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        toRemove.forEach(alerts::remove);
        log.info("Deleted {} old alerts", toRemove.size());

        return toRemove.size();
    }

    /**
     * Get alert statistics
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", alerts.size());
        stats.put("firing", getAlertsByStatus("firing").size());
        stats.put("resolved", getAlertsByStatus("resolved").size());
        stats.put("acknowledged", alerts.values().stream().filter(Alert::isAcknowledged).count());

        Map<String, Long> bySeverity = alerts.values().stream()
                .collect(Collectors.groupingBy(Alert::getSeverity, Collectors.counting()));
        stats.put("bySeverity", bySeverity);

        return stats;
    }

    /**
     * Parse ISO datetime string to LocalDateTime
     */
    private LocalDateTime parseDateTime(String dateTime) {
        try {
            return LocalDateTime.parse(dateTime, isoFormatter);
        } catch (Exception e) {
            log.warn("Failed to parse datetime: {}", dateTime);
            return LocalDateTime.now();
        }
    }
}
