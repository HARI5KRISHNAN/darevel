package com.darevel.preview.controller;

import com.darevel.preview.dto.PreviewArtifactResponse;
import com.darevel.preview.service.PreviewFileService;
import com.darevel.preview.service.StorageService;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preview/files/{fileId}/artifacts")
public class PreviewArtifactController {

    private final PreviewFileService previewFileService;
    private final StorageService storageService;

    public PreviewArtifactController(PreviewFileService previewFileService, StorageService storageService) {
        this.previewFileService = previewFileService;
        this.storageService = storageService;
    }

    @GetMapping
    public ResponseEntity<?> list(@PathVariable UUID fileId, @RequestParam("orgId") String orgId) {
        return ResponseEntity.ok(previewFileService.listArtifacts(fileId, orgId));
    }

    @GetMapping("/{artifactId}/url")
    public ResponseEntity<Map<String, String>> presignedUrl(@PathVariable UUID fileId,
                                                            @PathVariable UUID artifactId,
                                                            @RequestParam("orgId") String orgId) {
        PreviewArtifactResponse artifact = previewFileService.listArtifacts(fileId, orgId).stream()
            .filter(a -> a.getId().equals(artifactId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Artifact not found"));
        String url = storageService.presign(artifact.getStorageKey(), 10);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
