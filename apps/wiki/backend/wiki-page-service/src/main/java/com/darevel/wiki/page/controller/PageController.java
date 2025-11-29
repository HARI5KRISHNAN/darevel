package com.darevel.wiki.page.controller;

import com.darevel.wiki.page.dto.CreatePageRequest;
import com.darevel.wiki.page.dto.PageResponse;
import com.darevel.wiki.page.dto.PageRevisionResponse;
import com.darevel.wiki.page.dto.PageSummaryResponse;
import com.darevel.wiki.page.dto.UpdatePageRequest;
import com.darevel.wiki.page.service.PageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wiki/pages")
@RequiredArgsConstructor
@Validated
public class PageController {

    private final PageService pageService;

    @PostMapping
    public ResponseEntity<PageResponse> createPage(@Valid @RequestBody CreatePageRequest request) {
        PageResponse response = pageService.createPage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{pageId}")
    public PageResponse getPage(@PathVariable UUID pageId) {
        return pageService.getPage(pageId);
    }

    @GetMapping
    public List<PageSummaryResponse> listPages(@RequestParam @NotNull UUID spaceId) {
        return pageService.listPages(spaceId);
    }

    @PutMapping("/{pageId}")
    public PageResponse updatePage(@PathVariable UUID pageId, @Valid @RequestBody UpdatePageRequest request) {
        return pageService.updatePage(pageId, request);
    }

    @DeleteMapping("/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable UUID pageId) {
        pageService.deletePage(pageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{pageId}/revisions/{revisionNumber}")
    public PageRevisionResponse getRevision(
        @PathVariable UUID pageId,
        @PathVariable long revisionNumber
    ) {
        return pageService.getRevision(pageId, revisionNumber);
    }
}
