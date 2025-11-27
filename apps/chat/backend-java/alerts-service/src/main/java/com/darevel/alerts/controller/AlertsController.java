package com.darevel.alerts.controller;

import com.darevel.alerts.dto.Alert;
import com.darevel.alerts.dto.PrometheusWebhook;
import com.darevel.alerts.service.AlertsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AlertsController {

    private final AlertsService alertsService;

    /**
     * Prometheus webhook endpoint
     * POST /api/alerts/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody PrometheusWebhook webhook) {
        try {
            log.info("Received Prometheus webhook: {}", webhook.getGroupKey());
            List<Alert> alerts = alertsService.processWebhook(webhook);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("alertsProcessed", alerts.size());
            response.put("alerts", alerts);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing webhook", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get all alerts
     * GET /api/alerts
     */
    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity
    ) {
        try {
            List<Alert> alerts;

            if (status != null && !status.isEmpty()) {
                alerts = alertsService.getAlertsByStatus(status);
            } else if (severity != null && !severity.isEmpty()) {
                alerts = alertsService.getAlertsBySeverity(severity);
            } else {
                alerts = alertsService.getAllAlerts();
            }

            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            log.error("Error getting alerts", e);
            throw new RuntimeException("Failed to get alerts: " + e.getMessage(), e);
        }
    }

    /**
     * Get alert by ID
     * GET /api/alerts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlert(@PathVariable String id) {
        return alertsService.getAlertById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Acknowledge an alert
     * POST /api/alerts/{id}/acknowledge
     */
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String acknowledgedBy = body != null ? body.getOrDefault("user", "system") : "system";

        return alertsService.acknowledgeAlert(id, acknowledgedBy)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete old resolved alerts
     * DELETE /api/alerts/old
     */
    @DeleteMapping("/old")
    public ResponseEntity<Map<String, Object>> deleteOldAlerts(
            @RequestParam(defaultValue = "7") int days
    ) {
        try {
            int deleted = alertsService.deleteOldAlerts(days);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deleted", deleted);
            response.put("message", String.format("Deleted %d alerts older than %d days", deleted, days));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting old alerts", e);
            throw new RuntimeException("Failed to delete old alerts: " + e.getMessage(), e);
        }
    }

    /**
     * Get alert statistics
     * GET /api/alerts/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = alertsService.getStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting alert statistics", e);
            throw new RuntimeException("Failed to get statistics: " + e.getMessage(), e);
        }
    }
}
