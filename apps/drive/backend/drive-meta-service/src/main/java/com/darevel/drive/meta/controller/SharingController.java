package com.darevel.drive.meta.controller;

import com.darevel.drive.meta.dto.CreateShareLinkRequest;
import com.darevel.drive.meta.dto.GrantPermissionRequest;
import com.darevel.drive.meta.dto.PermissionResponse;
import com.darevel.drive.meta.dto.ShareLinkResponse;
import com.darevel.drive.meta.service.SharingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drive/sharing")
@RequiredArgsConstructor
public class SharingController {

    private final SharingService sharingService;

    // Permissions
    @PostMapping("/nodes/{nodeId}/permissions")
    public ResponseEntity<PermissionResponse> grantPermission(
        @PathVariable UUID nodeId,
        @Valid @RequestBody GrantPermissionRequest request
    ) {
        PermissionResponse response = sharingService.grantPermission(nodeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/nodes/{nodeId}/permissions")
    public ResponseEntity<Void> revokePermission(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID userId
    ) {
        sharingService.revokePermission(nodeId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nodes/{nodeId}/permissions")
    public List<PermissionResponse> listPermissions(@PathVariable UUID nodeId) {
        return sharingService.listPermissions(nodeId);
    }

    @GetMapping("/shared-with-me")
    public List<UUID> listSharedWithMe(@RequestParam @NotNull UUID userId) {
        return sharingService.listSharedWithMe(userId);
    }

    // Share Links
    @PostMapping("/nodes/{nodeId}/links")
    public ResponseEntity<ShareLinkResponse> createShareLink(
        @PathVariable UUID nodeId,
        @Valid @RequestBody CreateShareLinkRequest request
    ) {
        ShareLinkResponse response = sharingService.createShareLink(nodeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/links/{shareLinkId}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable UUID shareLinkId) {
        sharingService.revokeShareLink(shareLinkId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nodes/{nodeId}/links")
    public List<ShareLinkResponse> listShareLinks(@PathVariable UUID nodeId) {
        return sharingService.listShareLinks(nodeId);
    }

    @GetMapping("/links/{shareToken}")
    public ShareLinkResponse getShareLink(@PathVariable String shareToken) {
        return sharingService.getShareLink(shareToken);
    }
}
