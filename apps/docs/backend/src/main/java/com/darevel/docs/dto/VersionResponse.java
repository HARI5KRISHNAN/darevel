package com.darevel.docs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VersionResponse {

    private UUID id;
    private UUID documentId;
    private Integer versionNumber;
    private String createdBy;
    private String createdByName;
    private Map<String, Object> snapshot;
    private String snapshotUrl;
    private String description;
    private LocalDateTime createdAt;
}
