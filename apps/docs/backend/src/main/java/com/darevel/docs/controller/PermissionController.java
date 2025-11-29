package com.darevel.docs.controller;

import com.darevel.docs.dto.PermissionRequest;
import com.darevel.docs.dto.PermissionResponse;
import com.darevel.docs.enums.PermissionRole;
import com.darevel.docs.service.PermissionService;
import com.darevel.docs.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents/{documentId}/permissions")
@RequiredArgsConstructor
@Slf4j
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getPermissions(@PathVariable UUID documentId) {
        log.info("Getting permissions for document: {}", documentId);
        List<PermissionResponse> permissions = permissionService.getPermissions(documentId);
        return ResponseEntity.ok(permissions);
    }

    @PostMapping
    public ResponseEntity<PermissionResponse> addPermission(
            @PathVariable UUID documentId,
            @Valid @RequestBody PermissionRequest request) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        log.info("Adding permission for document: {}, user: {}", documentId, request.getUserId());
        PermissionResponse response = permissionService.addPermission(documentId, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<PermissionResponse> updatePermission(
            @PathVariable UUID documentId,
            @PathVariable String userId,
            @RequestParam PermissionRole role) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        log.info("Updating permission for document: {}, user: {}, role: {}", documentId, userId, role);
        PermissionResponse response = permissionService.updatePermission(documentId, userId, role, currentUserId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removePermission(
            @PathVariable UUID documentId,
            @PathVariable String userId) {
        String currentUserId = SecurityUtil.getCurrentUserId();
        log.info("Removing permission for document: {}, user: {}", documentId, userId);
        permissionService.removePermission(documentId, userId, currentUserId);
        return ResponseEntity.noContent().build();
    }
}
