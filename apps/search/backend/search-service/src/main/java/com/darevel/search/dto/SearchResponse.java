package com.darevel.search.dto;

import java.util.List;

public record SearchResponse(
        List<SearchResultDto> results,
        long totalHits,
        int page,
        int size,
        long took,
        boolean cached) {
}
