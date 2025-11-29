package com.darevel.docs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollaboratorInfo {

    private String userId;
    private String userName;
    private String userEmail;
    private String sessionId;
    private Map<String, Object> cursorPosition;
    private LocalDateTime connectedAt;
    private LocalDateTime lastSeenAt;
    private Boolean isActive;
    private String color; // For cursor/selection highlighting
}
