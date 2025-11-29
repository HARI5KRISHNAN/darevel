package com.darevel.search.dto;

import java.time.Instant;
import java.util.Map;

public record SearchStatsResponse(
        long documentsIndexed,
        long last24hQueries,
        long cacheHits,
        long cacheMisses,
        Map<String, Long> documentsPerType,
        Instant lastReindexedAt) {
}
