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
public class ActivityResponse {

    private UUID id;
    private UUID documentId;
    private String userId;
    private String userName;
    private String action;
    private Map<String, Object> details;
    private LocalDateTime createdAt;
}
