package com.darevel.docs.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private UUID id;
    private String orgId;
    private String title;
    private String ownerId;
    private String ownerName;
    private Map<String, Object> content;
    private Boolean isTemplate;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Additional fields for detailed response
    private List<PermissionResponse> permissions;
    private List<CollaboratorInfo> activeCollaborators;
    private Long versionCount;
    private Long commentCount;
    private String currentUserRole;
}
