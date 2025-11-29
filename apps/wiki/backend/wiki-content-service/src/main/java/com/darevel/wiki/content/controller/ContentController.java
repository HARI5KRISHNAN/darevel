package com.darevel.wiki.content.controller;

import com.darevel.wiki.content.dto.AddBlockRequest;
import com.darevel.wiki.content.dto.ContentHistoryResponse;
import com.darevel.wiki.content.dto.ContentResponse;
import com.darevel.wiki.content.dto.CreateContentRequest;
import com.darevel.wiki.content.dto.DeleteBlockRequest;
import com.darevel.wiki.content.dto.RestoreVersionRequest;
import com.darevel.wiki.content.dto.UpdateBlockRequest;
import com.darevel.wiki.content.dto.UpdateContentRequest;
import com.darevel.wiki.content.service.ContentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@RequestMapping("/api/wiki/content")
@RequiredArgsConstructor
@Validated
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<ContentResponse> createContent(@Valid @RequestBody CreateContentRequest request) {
        ContentResponse response = contentService.createContent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{pageId}")
    public ContentResponse getContent(@PathVariable UUID pageId) {
        return contentService.getContent(pageId);
    }

    @PutMapping("/{pageId}")
    public ContentResponse updateContent(
        @PathVariable UUID pageId,
        @Valid @RequestBody UpdateContentRequest request
    ) {
        return contentService.updateContent(pageId, request);
    }

    @PutMapping("/{pageId}/blocks/{blockId}")
    public ContentResponse updateBlock(
        @PathVariable UUID pageId,
        @PathVariable String blockId,
        @Valid @RequestBody UpdateBlockRequest request
    ) {
        return contentService.updateBlock(pageId, blockId, request);
    }

    @PostMapping("/{pageId}/blocks")
    public ContentResponse addBlock(
        @PathVariable UUID pageId,
        @Valid @RequestBody AddBlockRequest request
    ) {
        return contentService.addBlock(pageId, request.block(), request.userId(), request.expectedVersion());
    }

    @DeleteMapping("/{pageId}/blocks/{blockId}")
    public ContentResponse deleteBlock(
        @PathVariable UUID pageId,
        @PathVariable String blockId,
        @Valid @RequestBody DeleteBlockRequest request
    ) {
        return contentService.deleteBlock(pageId, blockId, request.userId(), request.expectedVersion());
    }

    @GetMapping("/{pageId}/history")
    public List<ContentHistoryResponse> getHistory(
        @PathVariable UUID pageId,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit
    ) {
        return contentService.getHistory(pageId, limit);
    }

    @GetMapping("/{pageId}/history/{version}")
    public ContentHistoryResponse getVersion(
        @PathVariable UUID pageId,
        @PathVariable Long version
    ) {
        return contentService.getVersion(pageId, version);
    }

    @PostMapping("/{pageId}/history/{version}/restore")
    public ContentResponse restoreVersion(
        @PathVariable UUID pageId,
        @PathVariable Long version,
        @Valid @RequestBody RestoreVersionRequest request
    ) {
        return contentService.restoreVersion(pageId, version, request.userId(), request.expectedVersion());
    }
}
