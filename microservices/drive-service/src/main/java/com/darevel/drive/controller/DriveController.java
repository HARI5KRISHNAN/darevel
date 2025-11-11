package com.darevel.drive.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.drive.dto.FileDTO;
import com.darevel.drive.service.DriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/drive")
@RequiredArgsConstructor
public class DriveController {

    private final DriveService driveService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<FileDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        FileDTO fileDTO = driveService.uploadFile(file, jwt);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileDTO));
    }

    @GetMapping("/files")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getUserFiles(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        List<FileDTO> files = driveService.getUserFiles(jwt);
        return ResponseEntity.ok(ApiResponse.success(files));
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            Authentication authentication) throws IOException {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Resource resource = driveService.downloadFile(fileId, jwt);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long fileId,
            Authentication authentication) throws IOException {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        driveService.deleteFile(fileId, jwt);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }
}
