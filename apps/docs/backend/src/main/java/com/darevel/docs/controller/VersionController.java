package com.darevel.docs.controller;

import com.darevel.docs.dto.CreateVersionRequest;
import com.darevel.docs.dto.VersionResponse;
import com.darevel.docs.service.VersionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents/{documentId}/versions")
@RequiredArgsConstructor
@Slf4j
public class VersionController {

    private final VersionService versionService;

    @PostMapping
    public ResponseEntity<VersionResponse> createVersion(
            @PathVariable UUID documentId,
            @Valid @RequestBody CreateVersionRequest request) {
        log.info("Creating version for document: {}", documentId);
        VersionResponse response = versionService.createVersion(documentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<VersionResponse>> getVersions(@PathVariable UUID documentId) {
        log.info("Getting versions for document: {}", documentId);
        List<VersionResponse> versions = versionService.getVersions(documentId);
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/{versionNumber}")
    public ResponseEntity<VersionResponse> getVersion(
            @PathVariable UUID documentId,
            @PathVariable Integer versionNumber) {
        log.info("Getting version {} for document: {}", versionNumber, documentId);
        VersionResponse response = versionService.getVersion(documentId, versionNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{versionNumber}/restore")
    public ResponseEntity<Void> restoreVersion(
            @PathVariable UUID documentId,
            @PathVariable Integer versionNumber) {
        log.info("Restoring version {} for document: {}", versionNumber, documentId);
        versionService.restoreVersion(documentId, versionNumber);
        return ResponseEntity.noContent().build();
    }
}
