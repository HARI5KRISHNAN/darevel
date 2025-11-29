package com.darevel.search.service;

import com.darevel.search.config.SearchProperties;
import com.darevel.search.dto.SearchStatsResponse;
import com.darevel.search.repository.SearchAuditRepository;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.model.IndexStats;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchStatsService {

    private final Client client;
    private final SearchProperties properties;
    private final SearchAuditRepository auditRepository;

    @Cacheable(cacheNames = "search-stats", key = "'global'")
    public SearchStatsResponse fetchStats() {
        long last24hQueries = auditRepository.countByExecutedAtAfter(Instant.now().minus(24, ChronoUnit.HOURS));
        long cacheHits = 0; // TODO: derive from Redis metrics once available
        long cacheMisses = 0;

        Index index = client.index(properties.getIndex());
        long documentsIndexed = 0;
        Map<String, Long> documentsPerType = Collections.emptyMap();
        try {
            IndexStats stats = index.getStats();
            documentsIndexed = stats.getNumberOfDocuments();
        } catch (Exception ex) {
            log.warn("Unable to pull index stats", ex);
        }

        return new SearchStatsResponse(
                documentsIndexed,
                last24hQueries,
                cacheHits,
                cacheMisses,
                documentsPerType,
                Instant.now());
    }
}
