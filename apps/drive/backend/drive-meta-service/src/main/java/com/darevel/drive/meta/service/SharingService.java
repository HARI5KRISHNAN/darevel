package com.darevel.drive.meta.service;

import com.darevel.drive.meta.domain.DrivePermission;
import com.darevel.drive.meta.domain.DriveShareLink;
import com.darevel.drive.meta.domain.PermissionLevel;
import com.darevel.drive.meta.dto.CreateShareLinkRequest;
import com.darevel.drive.meta.dto.GrantPermissionRequest;
import com.darevel.drive.meta.dto.PermissionResponse;
import com.darevel.drive.meta.dto.ShareLinkResponse;
import com.darevel.drive.meta.exception.NodeNotFoundException;
import com.darevel.drive.meta.repository.DriveNodeRepository;
import com.darevel.drive.meta.repository.DrivePermissionRepository;
import com.darevel.drive.meta.repository.DriveShareLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SharingService {

    private final DrivePermissionRepository permissionRepository;
    private final DriveShareLinkRepository shareLinkRepository;
    private final DriveNodeRepository nodeRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${drive.share-link-base-url:http://localhost:3000/drive/shared}")
    private String shareLinkBaseUrl;

    @Transactional
    public PermissionResponse grantPermission(UUID nodeId, GrantPermissionRequest request) {
        // Verify node exists
        nodeRepository.findById(nodeId)
            .orElseThrow(() -> new NodeNotFoundException("Node not found: " + nodeId));

        // Check if permission already exists
        DrivePermission permission = permissionRepository
            .findByNodeIdAndUserId(nodeId, request.userId())
            .orElseGet(() -> DrivePermission.builder()
                .nodeId(nodeId)
                .userId(request.userId())
                .build());

        permission.setPermissionLevel(request.permissionLevel());
        permission.setGrantedBy(request.grantedBy());
        permission.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        DrivePermission saved = permissionRepository.save(permission);
        log.info("Granted {} permission to user {} for node {}",
            request.permissionLevel(), request.userId(), nodeId);

        return toPermissionResponse(saved);
    }

    @Transactional
    public void revokePermission(UUID nodeId, UUID userId) {
        permissionRepository.deleteByNodeIdAndUserId(nodeId, userId);
        log.info("Revoked permission for user {} on node {}", userId, nodeId);
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listPermissions(UUID nodeId) {
        return permissionRepository.findAllByNodeId(nodeId).stream()
            .map(this::toPermissionResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UUID> listSharedWithMe(UUID userId) {
        return permissionRepository.findAllByUserId(userId).stream()
            .map(DrivePermission::getNodeId)
            .toList();
    }

    @Transactional
    public ShareLinkResponse createShareLink(UUID nodeId, CreateShareLinkRequest request) {
        // Verify node exists
        nodeRepository.findById(nodeId)
            .orElseThrow(() -> new NodeNotFoundException("Node not found: " + nodeId));

        String shareToken = UUID.randomUUID().toString().replace("-", "");
        String passwordHash = request.password() != null
            ? passwordEncoder.encode(request.password())
            : null;

        DriveShareLink shareLink = DriveShareLink.builder()
            .nodeId(nodeId)
            .shareToken(shareToken)
            .permissionLevel(request.permissionLevel())
            .createdBy(request.createdBy())
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .expiresAt(request.expiresAt())
            .passwordHash(passwordHash)
            .downloadCount(0L)
            .maxDownloads(request.maxDownloads())
            .build();

        DriveShareLink saved = shareLinkRepository.save(shareLink);
        log.info("Created share link for node {}: {}", nodeId, shareToken);

        return toShareLinkResponse(saved);
    }

    @Transactional
    public void revokeShareLink(UUID shareLinkId) {
        shareLinkRepository.deleteById(shareLinkId);
        log.info("Revoked share link: {}", shareLinkId);
    }

    @Transactional(readOnly = true)
    public List<ShareLinkResponse> listShareLinks(UUID nodeId) {
        return shareLinkRepository.findAllByNodeId(nodeId).stream()
            .map(this::toShareLinkResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ShareLinkResponse getShareLink(String shareToken) {
        DriveShareLink shareLink = shareLinkRepository.findByShareToken(shareToken)
            .orElseThrow(() -> new NodeNotFoundException("Share link not found"));

        // Check if expired
        if (shareLink.getExpiresAt() != null &&
            shareLink.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new IllegalStateException("Share link has expired");
        }

        // Check download limit
        if (shareLink.getMaxDownloads() != null &&
            shareLink.getDownloadCount() >= shareLink.getMaxDownloads()) {
            throw new IllegalStateException("Share link download limit reached");
        }

        return toShareLinkResponse(shareLink);
    }

    @Transactional
    public void incrementDownloadCount(String shareToken) {
        DriveShareLink shareLink = shareLinkRepository.findByShareToken(shareToken)
            .orElseThrow(() -> new NodeNotFoundException("Share link not found"));

        shareLink.setDownloadCount(shareLink.getDownloadCount() + 1);
        shareLinkRepository.save(shareLink);
    }

    public boolean verifyShareLinkPassword(String shareToken, String password) {
        DriveShareLink shareLink = shareLinkRepository.findByShareToken(shareToken)
            .orElseThrow(() -> new NodeNotFoundException("Share link not found"));

        if (shareLink.getPasswordHash() == null) {
            return true; // No password required
        }

        return passwordEncoder.matches(password, shareLink.getPasswordHash());
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(UUID nodeId, UUID userId, PermissionLevel requiredLevel) {
        return permissionRepository.findByNodeIdAndUserId(nodeId, userId)
            .map(p -> hasRequiredLevel(p.getPermissionLevel(), requiredLevel))
            .orElse(false);
    }

    private boolean hasRequiredLevel(PermissionLevel current, PermissionLevel required) {
        return switch (required) {
            case VIEW -> current == PermissionLevel.VIEW ||
                        current == PermissionLevel.EDIT ||
                        current == PermissionLevel.OWNER;
            case EDIT -> current == PermissionLevel.EDIT ||
                        current == PermissionLevel.OWNER;
            case OWNER -> current == PermissionLevel.OWNER;
        };
    }

    private PermissionResponse toPermissionResponse(DrivePermission permission) {
        return new PermissionResponse(
            permission.getId(),
            permission.getNodeId(),
            permission.getUserId(),
            permission.getPermissionLevel(),
            permission.getGrantedBy(),
            permission.getCreatedAt()
        );
    }

    private ShareLinkResponse toShareLinkResponse(DriveShareLink shareLink) {
        String shareUrl = shareLinkBaseUrl + "/" + shareLink.getShareToken();
        return new ShareLinkResponse(
            shareLink.getId(),
            shareLink.getNodeId(),
            shareLink.getShareToken(),
            shareUrl,
            shareLink.getPermissionLevel(),
            shareLink.getCreatedBy(),
            shareLink.getCreatedAt(),
            shareLink.getExpiresAt(),
            shareLink.getPasswordHash() != null,
            shareLink.getDownloadCount(),
            shareLink.getMaxDownloads()
        );
    }
}
