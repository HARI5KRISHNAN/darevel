package com.darevel.search.dto;

import java.time.Instant;
import java.util.List;

public record ReindexResponse(
        String status,
        Instant startedAt,
        List<String> workspaceIds,
        List<String> documentTypes,
        long documentsQueued) {
}
