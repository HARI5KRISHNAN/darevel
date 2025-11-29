package com.darevel.audit.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "User email is required")
    private String userEmail;

    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    private String resourceId;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    private String description;

    private String macAddress;

    private JsonNode metadata;
}
