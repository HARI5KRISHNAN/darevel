package com.darevel.incidents.service;

import com.darevel.incidents.dto.Incident;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class IncidentsService {

    private static final int MAX_INCIDENTS = 500;
    private final Map<String, Incident> incidents = new ConcurrentHashMap<>();
    private final java.util.concurrent.atomic.AtomicLong incidentCounter = new java.util.concurrent.atomic.AtomicLong(0);

    /**
     * Generate unique incident number in format INC001, INC002, etc.
     */
    private String generateIncidentNumber() {
        long count = incidentCounter.incrementAndGet();
        return String.format("INC%03d", count);
    }

    public Incident createIncident(Incident incident) {
        String id = UUID.randomUUID().toString();
        incident.setId(id);
        incident.setIncidentNumber(generateIncidentNumber());
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());
        incident.setStatus("open");

        // Calculate severity if not provided
        if (incident.getSeverity() == null) {
            incident.setSeverity(calculateSeverity(incident));
        }

        // Maintain max incidents limit
        if (incidents.size() >= MAX_INCIDENTS) {
            String oldestKey = incidents.keySet().stream()
                    .filter(k -> "resolved".equals(incidents.get(k).getStatus()))
                    .min(Comparator.comparing(k -> incidents.get(k).getCreatedAt()))
                    .orElse(null);
            if (oldestKey != null) {
                incidents.remove(oldestKey);
                log.debug("Removed oldest incident to maintain limit of {}", MAX_INCIDENTS);
            }
        }

        incidents.put(id, incident);
        log.info("Created incident: {} - {}", id, incident.getTitle());
        return incident;
    }

    public List<Incident> getAllIncidents() {
        return new ArrayList<>(incidents.values());
    }

    public List<Incident> getIncidentsByStatus(String status) {
        return incidents.values().stream()
                .filter(i -> i.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    public List<Incident> getIncidentsBySeverity(String severity) {
        return incidents.values().stream()
                .filter(i -> i.getSeverity().equalsIgnoreCase(severity))
                .collect(Collectors.toList());
    }

    public Optional<Incident> getIncidentById(String id) {
        return Optional.ofNullable(incidents.get(id));
    }

    public Optional<Incident> resolveIncident(String id, String resolvedBy, String resolution) {
        Incident incident = incidents.get(id);
        if (incident != null) {
            incident.setStatus("resolved");
            incident.setResolvedAt(LocalDateTime.now());
            incident.setResolvedBy(resolvedBy);
            incident.setResolution(resolution);
            incident.setUpdatedAt(LocalDateTime.now());

            // Calculate MTTR
            if (incident.getCreatedAt() != null && incident.getResolvedAt() != null) {
                Duration duration = Duration.between(incident.getCreatedAt(), incident.getResolvedAt());
                incident.setMttr(duration.toMinutes() / 60.0); // Convert to hours
            }

            log.info("Incident {} resolved by {}", id, resolvedBy);
            return Optional.of(incident);
        }
        return Optional.empty();
    }

    public int deleteOldIncidents(int days) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);

        List<String> toRemove = incidents.entrySet().stream()
                .filter(entry -> {
                    Incident incident = entry.getValue();
                    return "resolved".equalsIgnoreCase(incident.getStatus())
                            && incident.getResolvedAt() != null
                            && incident.getResolvedAt().isBefore(cutoffDate);
                })
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        toRemove.forEach(incidents::remove);
        log.info("Deleted {} old incidents", toRemove.size());
        return toRemove.size();
    }

    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", incidents.size());
        stats.put("open", getIncidentsByStatus("open").size());
        stats.put("investigating", getIncidentsByStatus("investigating").size());
        stats.put("resolved", getIncidentsByStatus("resolved").size());

        Map<String, Long> bySeverity = incidents.values().stream()
                .collect(Collectors.groupingBy(Incident::getSeverity, Collectors.counting()));
        stats.put("bySeverity", bySeverity);

        Map<String, Long> byCategory = incidents.values().stream()
                .filter(i -> i.getCategory() != null)
                .collect(Collectors.groupingBy(Incident::getCategory, Collectors.counting()));
        stats.put("byCategory", byCategory);

        // Calculate average MTTR
        double avgMttr = incidents.values().stream()
                .filter(i -> i.getMttr() != null)
                .mapToDouble(Incident::getMttr)
                .average()
                .orElse(0.0);
        stats.put("averageMTTR", avgMttr);

        return stats;
    }

    private String calculateSeverity(Incident incident) {
        int score = 0;

        // Category-based scoring
        if ("pod_failure".equals(incident.getCategory())) score += 3;
        if ("resource_exhaustion".equals(incident.getCategory())) score += 2;

        // Impact score
        if (incident.getImpactScore() != null) {
            score += incident.getImpactScore();
        }

        if (score >= 5) return "critical";
        if (score >= 3) return "high";
        if (score >= 1) return "medium";
        return "low";
    }
}
