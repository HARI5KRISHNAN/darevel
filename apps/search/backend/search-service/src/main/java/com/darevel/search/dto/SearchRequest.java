package com.darevel.search.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public record SearchRequest(
        @NotBlank(message = "query is required") String query,
        String category,
        @Min(0) Integer page,
        @Min(1) Integer size,
        String sortBy,
        String dateRange,
        Map<String, String> filters,
        List<String> tags) {

    public int resolvedPage(int fallback) {
        return page == null || page < 0 ? fallback : page;
    }

    public int resolvedSize(int defaultSize, int maxSize) {
        if (size == null || size <= 0) {
            return defaultSize;
        }
        return Math.min(size, maxSize);
    }

    public Map<String, String> safeFilters() {
        return filters == null ? Collections.emptyMap() : filters;
    }

    public List<String> safeTags() {
        return tags == null ? Collections.emptyList() : tags;
    }
}
