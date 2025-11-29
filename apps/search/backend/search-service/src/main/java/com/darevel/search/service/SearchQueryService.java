package com.darevel.search.service;

import com.darevel.search.config.SearchProperties;
import com.darevel.search.dto.SearchRequest;
import com.darevel.search.dto.SearchResponse;
import com.darevel.search.dto.SearchResultDto;
import com.darevel.search.dto.SuggestionResponse;
import com.darevel.search.entity.SearchAuditEntry;
import com.darevel.search.model.SearchContext;
import com.darevel.search.repository.SearchAuditRepository;
import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Index;
import com.meilisearch.sdk.SearchResult;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchQueryService {

    private final Client client;
    private final SearchProperties properties;
    private final SearchAuditRepository auditRepository;

    public SearchResponse search(SearchRequest request, SearchContext context) {
        int page = request.resolvedPage(0);
        int size = request.resolvedSize(properties.getDefaultPageSize(), properties.getMaxPageSize());

        com.meilisearch.sdk.SearchRequest meiliRequest = buildSearchRequest(request, page, size);

        Index index = client.index(properties.getIndex());
        long started = System.currentTimeMillis();
        SearchResult result = index.search(meiliRequest);
        long took = System.currentTimeMillis() - started;

        List<SearchResultDto> mapped = mapHits(result);
        Integer estimatedTotal = result.getEstimatedTotalHits();
        long totalHits = estimatedTotal != null ? estimatedTotal.longValue() : mapped.size();

        persistAudit(request, context, totalHits, took);

        return new SearchResponse(mapped, totalHits, page, size, took, false);
    }

    @Cacheable(cacheNames = "suggestions", key = "#query + ':' + #context.orgId()")
    public SuggestionResponse suggestions(String query, SearchContext context) {
        if (!StringUtils.hasText(query) || query.length() < 2) {
            return new SuggestionResponse(query, List.of());
        }

        com.meilisearch.sdk.SearchRequest meiliRequest = new com.meilisearch.sdk.SearchRequest(query)
                .setLimit(5)
                .setAttributesToRetrieve(new String[] {"title", "documentType"})
                .setAttributesToHighlight(new String[] {"title"});

        Index index = client.index(properties.getIndex());
        SearchResult result = index.search(meiliRequest);

        List<String> suggestions = result.getHits().stream()
                .map(hit -> (String) hit.getOrDefault("title", ""))
                .filter(StringUtils::hasText)
                .distinct()
                .limit(5)
                .toList();

        return new SuggestionResponse(query, suggestions);
    }

    private com.meilisearch.sdk.SearchRequest buildSearchRequest(SearchRequest request, int page, int size) {
        com.meilisearch.sdk.SearchRequest meiliRequest = new com.meilisearch.sdk.SearchRequest(request.query())
                .setOffset(page * size)
                .setLimit(size)
                .setAttributesToCrop(new String[] {"content"})
                .setCropLength(120)
                .setAttributesToHighlight(new String[] {"content", "title"});

        List<String> filters = new ArrayList<>();
        if (StringUtils.hasText(request.category())) {
            filters.add(String.format("documentType = \"%s\"", request.category()));
        }
        request.safeFilters().forEach((key, value) -> {
            if (StringUtils.hasText(value)) {
                filters.add(String.format("%s = \"%s\"", key, value));
            }
        });
        String filterExpression = filters.isEmpty() ? null : String.join(" AND ", filters);

        if (!request.safeTags().isEmpty()) {
            String tagFilter = request.safeTags().stream()
                    .map(tag -> String.format("tags = \"%s\"", tag))
                    .collect(Collectors.joining(" OR "));
            filterExpression = filterExpression == null
                    ? "(" + tagFilter + ")"
                    : filterExpression + " AND (" + tagFilter + ")";
        }

        if (filterExpression != null) {
            meiliRequest.setFilter(filterExpression);
        }

        return meiliRequest;
    }

    private List<SearchResultDto> mapHits(SearchResult result) {
        List<HashMap<String, Object>> hits = result.getHits();
        if (hits == null || hits.isEmpty()) {
            return List.of();
        }
        return hits.stream().map(this::mapSingleHit).toList();
    }

    @SuppressWarnings("unchecked")
    private SearchResultDto mapSingleHit(HashMap<String, Object> hit) {
        String documentId = asString(hit.getOrDefault("documentId", hit.get("id")));
        String workspaceId = asString(hit.get("workspaceId"));
        String documentType = asString(hit.get("documentType"));
        String title = asString(hit.getOrDefault("title", "Untitled"));
        String owner = asString(hit.get("owner"));
        Set<String> tags = extractTags(hit.get("tags"));
        Map<String, Object> metadata = extractMetadata(hit.get("metadata"));
        Instant updatedAt = parseInstant(hit.get("updatedAt"));
        double relevance = hit.containsKey("_rankingScore")
                ? ((Number) hit.get("_rankingScore")).doubleValue()
                : 0d;

        String snippet = extractSnippet(hit);

        return new SearchResultDto(documentId, workspaceId, documentType, title, snippet, owner, tags, metadata, updatedAt, relevance);
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractTags(Object value) {
        if (value instanceof List<?> rawList) {
            return rawList.stream().map(Object::toString).collect(Collectors.toSet());
        }
        return Collections.emptySet();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractMetadata(Object value) {
        if (value instanceof Map<?, ?> rawMap) {
            return new HashMap<>((Map<String, Object>) rawMap);
        }
        return Collections.emptyMap();
    }

    private String extractSnippet(Map<String, Object> hit) {
        Object formatted = hit.get("_formatted");
        if (formatted instanceof Map<?, ?> formattedMap) {
            Object content = formattedMap.get("content");
            if (content instanceof String contentString && StringUtils.hasText(contentString)) {
                return contentString;
            }
        }
        Object snippet = hit.getOrDefault("snippet", hit.get("content"));
        return asString(snippet);
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private Instant parseInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof String str && StringUtils.hasText(str)) {
            try {
                return Instant.parse(str);
            } catch (Exception ex) {
                log.debug("Unable to parse instant from {}", str, ex);
            }
        }
        return Instant.EPOCH;
    }

    private void persistAudit(SearchRequest request, SearchContext context, long totalHits, long took) {
        SearchAuditEntry entry = SearchAuditEntry.builder()
                .query(request.query())
                .userId(context.userId())
                .workspaceId(context.orgId())
                .totalHits(totalHits)
                .executedAt(Instant.now())
                .tookMs(took)
                .build();
        auditRepository.save(entry);
    }
}
