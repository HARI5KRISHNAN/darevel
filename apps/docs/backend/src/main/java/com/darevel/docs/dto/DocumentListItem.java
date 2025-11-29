package com.darevel.docs.dto;

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
public class DocumentListItem {

    private UUID id;
    private String title;
    private String ownerId;
    private String ownerName;
    private Boolean isTemplate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String currentUserRole;
    private Integer activeCollaborators;
    private Long commentCount;
}
