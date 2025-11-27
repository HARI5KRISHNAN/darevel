package com.darevel.alerts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    private String id;
    private String status;
    private String severity;
    private String alertName;
    private String summary;
    private String description;
    private Map<String, String> labels;
    private Map<String, String> annotations;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private LocalDateTime acknowledgedAt;
    private String acknowledgedBy;
    private boolean acknowledged;
    private String fingerprint;
    private String generatorURL;
}
