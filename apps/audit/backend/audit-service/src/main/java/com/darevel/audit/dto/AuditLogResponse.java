package com.darevel.audit.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private UUID id;
    private UUID workspaceId;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String action;
    private String resourceType;
    private String resourceId;
    private String resourceName;
    private String description;
    private String ipAddress;
    private String macAddress;
    private String userAgent;
    private JsonNode metadata;
    private OffsetDateTime timestamp;
}
