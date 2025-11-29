package com.darevel.preview.controller;

import com.darevel.preview.domain.PreviewStatus;
import com.darevel.preview.dto.PreviewFileRequest;
import com.darevel.preview.dto.PreviewFileResponse;
import com.darevel.preview.dto.PreviewInsightResponse;
import com.darevel.preview.dto.RegeneratePreviewResponse;
import com.darevel.preview.service.PreviewFileService;
import com.darevel.preview.service.PreviewInsightsService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preview/files")
public class PreviewFileController {

    private final PreviewFileService previewFileService;
    private final PreviewInsightsService insightsService;

    public PreviewFileController(PreviewFileService previewFileService, PreviewInsightsService insightsService) {
        this.previewFileService = previewFileService;
        this.insightsService = insightsService;
    }

    @PostMapping
    public ResponseEntity<PreviewFileResponse> register(@RequestBody @Valid PreviewFileRequest request,
                                                        @RequestHeader(value = "X-Darevel-Org-Id", required = false) String orgHeader,
                                                        Principal principal) {
        request.setOrgId(request.getOrgId() != null ? request.getOrgId() : orgHeader);
        if (principal != null) {
            request.setOwnerId(request.getOwnerId() != null ? request.getOwnerId() : principal.getName());
        }
        if (request.getOrgId() == null) {
            throw new IllegalArgumentException("Organization identifier is required");
        }
        if (request.getOwnerId() == null) {
            throw new IllegalArgumentException("Owner identifier is required");
        }
        PreviewFileResponse response = previewFileService.registerFile(request);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping
    public Page<PreviewFileResponse> list(@RequestParam("orgId") String orgId,
                                          @RequestParam(value = "status", required = false) List<PreviewStatus> statuses,
                                          @PageableDefault(size = 20) Pageable pageable) {
        return previewFileService.listFiles(orgId, statuses, pageable);
    }

    @GetMapping("/{id}")
    public PreviewFileResponse get(@PathVariable UUID id, @RequestParam("orgId") String orgId) {
        return previewFileService.getFile(id, orgId);
    }

    @PostMapping("/{id}/regenerate")
    public RegeneratePreviewResponse regenerate(@PathVariable UUID id, @RequestParam("orgId") String orgId) {
        return previewFileService.regenerate(id, orgId);
    }

    @GetMapping("/{id}/insights")
    public PreviewInsightResponse insights(@PathVariable UUID id, @RequestParam("orgId") String orgId) {
        PreviewFileResponse file = previewFileService.getFile(id, orgId);
        return insightsService.summarize("No text extracted yet", file.getFilename());
    }
}
