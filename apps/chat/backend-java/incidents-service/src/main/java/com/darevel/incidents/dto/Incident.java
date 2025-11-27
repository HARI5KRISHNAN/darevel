package com.darevel.incidents.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    private String id;
    private String incidentNumber; // Unique INC number (e.g., INC001, INC002)
    private String title;
    private String description;
    private String severity; // critical, high, medium, low
    private String status; // open, investigating, resolved
    private String category; // pod_failure, resource_exhaustion, network, etc.
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
    private String resolvedBy;
    private String resolution;
    private Map<String, String> metadata;
    private List<String> relatedAlerts;
    private String affectedResource;
    private String namespace;
    private Double mttr; // Mean Time To Resolve in minutes
    private String rootCause;
    private Integer impactScore;
}
