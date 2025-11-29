package com.darevel.search.controller;

import com.darevel.search.dto.ReindexRequest;
import com.darevel.search.dto.ReindexResponse;
import com.darevel.search.dto.SearchRequest;
import com.darevel.search.dto.SearchResponse;
import com.darevel.search.dto.SearchStatsResponse;
import com.darevel.search.dto.SuggestionResponse;
import com.darevel.search.model.SearchContext;
import com.darevel.search.service.ReindexService;
import com.darevel.search.service.SearchQueryService;
import com.darevel.search.service.SearchStatsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/search", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Validated
public class SearchController {

    private final SearchQueryService searchQueryService;
    private final ReindexService reindexService;
    private final SearchStatsService searchStatsService;

    @PostMapping(path = "/query", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SearchResponse query(
            @Valid @RequestBody SearchRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Org-Id") String orgId) {
        return searchQueryService.search(request, new SearchContext(userId, orgId));
    }

    @GetMapping(path = "/suggestions")
    public SuggestionResponse suggestions(
            @RequestParam("q") @NotBlank String query,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Org-Id") String orgId) {
        return searchQueryService.suggestions(query, new SearchContext(userId, orgId));
    }

    @PostMapping(path = "/reindex", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ReindexResponse reindex(
            @Valid @RequestBody ReindexRequest request,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-Org-Id") String orgId) {
        return reindexService.triggerReindex(request, new SearchContext(userId, orgId));
    }

    @GetMapping(path = "/stats")
    public SearchStatsResponse stats() {
        return searchStatsService.fetchStats();
    }
}
