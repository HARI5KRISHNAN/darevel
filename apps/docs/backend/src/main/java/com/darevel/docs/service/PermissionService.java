package com.darevel.docs.service;

import com.darevel.docs.dto.PermissionRequest;
import com.darevel.docs.dto.PermissionResponse;
import com.darevel.docs.entity.Document;
import com.darevel.docs.entity.DocumentPermission;
import com.darevel.docs.enums.PermissionRole;
import com.darevel.docs.repository.DocumentPermissionRepository;
import com.darevel.docs.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {

    private final DocumentPermissionRepository permissionRepository;
    private final DocumentRepository documentRepository;
    private final ActivityService activityService;

    @Transactional(readOnly = true)
    public List<PermissionResponse> getPermissions(UUID documentId) {
        List<DocumentPermission> permissions = permissionRepository.findByDocumentId(documentId);
        return permissions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PermissionResponse addPermission(UUID documentId, PermissionRequest request, String currentUserId) {
        // Check if current user is owner
        checkOwnerAccess(documentId, currentUserId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check if permission already exists
        if (request.getUserId() != null) {
            permissionRepository.findByDocumentIdAndUserId(documentId, request.getUserId())
                    .ifPresent(p -> {
                        throw new RuntimeException("Permission already exists for this user");
                    });
        }

        DocumentPermission permission = DocumentPermission.builder()
                .document(document)
                .userId(request.getUserId())
                .teamId(request.getTeamId())
                .role(request.getRole())
                .build();

        permission = permissionRepository.save(permission);

        activityService.logActivity(documentId, currentUserId, "PERMISSION_ADDED",
                java.util.Map.of("userId", request.getUserId(), "role", request.getRole()));

        log.info("Permission added for document: {}, user: {}, role: {}",
                documentId, request.getUserId(), request.getRole());

        return mapToResponse(permission);
    }

    @Transactional
    public PermissionResponse updatePermission(UUID documentId, String targetUserId,
                                                PermissionRole newRole, String currentUserId) {
        checkOwnerAccess(documentId, currentUserId);

        DocumentPermission permission = permissionRepository
                .findByDocumentIdAndUserId(documentId, targetUserId)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setRole(newRole);
        permission = permissionRepository.save(permission);

        activityService.logActivity(documentId, currentUserId, "PERMISSION_UPDATED",
                java.util.Map.of("userId", targetUserId, "newRole", newRole));

        return mapToResponse(permission);
    }

    @Transactional
    public void removePermission(UUID documentId, String targetUserId, String currentUserId) {
        checkOwnerAccess(documentId, currentUserId);

        permissionRepository.deleteByDocumentIdAndUserId(documentId, targetUserId);

        activityService.logActivity(documentId, currentUserId, "PERMISSION_REMOVED",
                java.util.Map.of("userId", targetUserId));

        log.info("Permission removed for document: {}, user: {}", documentId, targetUserId);
    }

    @Transactional(readOnly = true)
    public PermissionRole getUserRole(UUID documentId, String userId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Owner has implicit OWNER role
        if (document.getOwnerId().equals(userId)) {
            return PermissionRole.OWNER;
        }

        return permissionRepository.findRoleByDocumentIdAndUserId(documentId, userId)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public void checkAccess(UUID documentId, String userId) {
        PermissionRole role = getUserRole(documentId, userId);
        if (role == null) {
            throw new RuntimeException("Access denied: No permission for this document");
        }
    }

    @Transactional(readOnly = true)
    public void checkEditAccess(UUID documentId, String userId) {
        PermissionRole role = getUserRole(documentId, userId);
        if (role == null || !role.canEdit()) {
            throw new RuntimeException("Access denied: Edit permission required");
        }
    }

    @Transactional(readOnly = true)
    public void checkOwnerAccess(UUID documentId, String userId) {
        PermissionRole role = getUserRole(documentId, userId);
        if (role == null || !role.canManagePermissions()) {
            throw new RuntimeException("Access denied: Owner permission required");
        }
    }

    @Transactional(readOnly = true)
    public void checkCommentAccess(UUID documentId, String userId) {
        PermissionRole role = getUserRole(documentId, userId);
        if (role == null || !role.canComment()) {
            throw new RuntimeException("Access denied: Comment permission required");
        }
    }

    private PermissionResponse mapToResponse(DocumentPermission permission) {
        return PermissionResponse.builder()
                .id(permission.getId())
                .documentId(permission.getDocument().getId())
                .userId(permission.getUserId())
                .teamId(permission.getTeamId())
                .role(permission.getRole())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
}
