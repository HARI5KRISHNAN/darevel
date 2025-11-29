package com.darevel.docs.dto;

import com.darevel.docs.enums.CommentStatus;
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
public class CommentResponse {

    private UUID id;
    private UUID documentId;
    private String authorId;
    private String authorName;
    private String authorEmail;
    private Map<String, Object> range;
    private String content;
    private CommentStatus status;
    private UUID parentId;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
    private String resolvedByName;
}
