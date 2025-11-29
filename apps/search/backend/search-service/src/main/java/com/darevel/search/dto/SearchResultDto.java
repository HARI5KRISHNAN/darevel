package com.darevel.search.dto;

import java.time.Instant;
import java.util.Map;
import java.util.Set;

public record SearchResultDto(
        String documentId,
        String workspaceId,
        String documentType,
        String title,
        String snippet,
        String owner,
        Set<String> tags,
        Map<String, Object> metadata,
        Instant updatedAt,
        double relevanceScore) {
}
