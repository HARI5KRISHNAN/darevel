package com.darevel.docs.dto;

import com.darevel.docs.enums.PermissionRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionResponse {

    private UUID id;
    private UUID documentId;
    private String userId;
    private String userName;
    private String userEmail;
    private String teamId;
    private String teamName;
    private PermissionRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
