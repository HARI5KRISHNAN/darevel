package com.darevel.search.dto;

import java.time.Instant;

public record SearchAuditEntryDto(
        String id,
        String query,
        String userId,
        String workspaceId,
        long totalHits,
        Instant executedAt,
        long tookMs) {
}
