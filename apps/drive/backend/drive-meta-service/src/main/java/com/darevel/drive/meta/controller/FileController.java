package com.darevel.drive.meta.controller;

import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@RestController
@RequestMapping("/api/drive/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NodeResponse> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam @NotNull UUID spaceId,
        @RequestParam(required = false) UUID parentId,
        @RequestParam @NotNull UUID ownerId
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        NodeResponse response = fileService.uploadFile(file, spaceId, parentId, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/{nodeId}/upload-version", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NodeResponse> uploadNewVersion(
        @PathVariable UUID nodeId,
        @RequestParam("file") MultipartFile file,
        @RequestParam @NotNull UUID actorId,
        @RequestParam(required = false) String comment
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        NodeResponse response = fileService.uploadNewVersion(nodeId, file, actorId, comment);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{nodeId}/download")
    public ResponseEntity<InputStreamResource> downloadFile(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID userId
    ) {
        FileService.DownloadResult result = fileService.downloadFile(nodeId, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.mimeType()));
        headers.setContentDispositionFormData("attachment", result.filename());
        headers.setContentLength(result.sizeBytes());

        return ResponseEntity.ok()
            .headers(headers)
            .body(new InputStreamResource(result.inputStream()));
    }

    @GetMapping("/{nodeId}/download/version/{versionNumber}")
    public ResponseEntity<InputStreamResource> downloadFileVersion(
        @PathVariable UUID nodeId,
        @PathVariable long versionNumber,
        @RequestParam @NotNull UUID userId
    ) {
        FileService.DownloadResult result = fileService.downloadFileVersion(nodeId, versionNumber, userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(result.mimeType()));
        headers.setContentDispositionFormData("attachment", result.filename());
        headers.setContentLength(result.sizeBytes());

        return ResponseEntity.ok()
            .headers(headers)
            .body(new InputStreamResource(result.inputStream()));
    }
}
