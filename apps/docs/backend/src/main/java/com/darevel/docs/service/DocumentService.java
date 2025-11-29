package com.darevel.docs.service;

import com.darevel.docs.dto.*;
import com.darevel.docs.entity.Document;
import com.darevel.docs.entity.DocumentPermission;
import com.darevel.docs.enums.PermissionRole;
import com.darevel.docs.repository.DocumentRepository;
import com.darevel.docs.repository.DocumentPermissionRepository;
import com.darevel.docs.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;
    private final PermissionService permissionService;
    private final ActivityService activityService;

    @Transactional
    public DocumentResponse createDocument(CreateDocumentRequest request) {
        String userId = SecurityUtil.getCurrentUserId();
        String userName = SecurityUtil.getCurrentUserName();

        Document document = Document.builder()
                .orgId(request.getOrgId())
                .title(request.getTitle())
                .ownerId(userId)
                .content(request.getContent() != null ? request.getContent() : new HashMap<>())
                .isTemplate(request.getIsTemplate())
                .build();

        document = documentRepository.save(document);

        // Create owner permission
        DocumentPermission ownerPermission = DocumentPermission.builder()
                .document(document)
                .userId(userId)
                .role(PermissionRole.OWNER)
                .build();
        permissionRepository.save(ownerPermission);

        // Log activity
        activityService.logActivity(document.getId(), userId, "CREATED",
                Map.of("title", request.getTitle()));

        log.info("Document created: {} by user: {}", document.getId(), userId);
        return mapToResponse(document);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocument(UUID documentId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        permissionService.checkAccess(documentId, SecurityUtil.getCurrentUserId());

        return mapToDetailedResponse(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentListItem> listDocuments(String orgId) {
        String userId = SecurityUtil.getCurrentUserId();
        List<Document> documents = documentRepository.findAccessibleDocuments(userId, orgId);

        return documents.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponse updateDocument(UUID documentId, UpdateDocumentRequest request) {
        String userId = SecurityUtil.getCurrentUserId();

        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        permissionService.checkEditAccess(documentId, userId);

        if (request.getTitle() != null) {
            document.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            document.setContent(request.getContent());
        }
        if (request.getIsTemplate() != null) {
            document.setIsTemplate(request.getIsTemplate());
        }

        document = documentRepository.save(document);

        activityService.logActivity(documentId, userId, "UPDATED",
                Map.of("changes", buildChangeMap(request)));

        return mapToResponse(document);
    }

    @Transactional
    public void deleteDocument(UUID documentId) {
        String userId = SecurityUtil.getCurrentUserId();

        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        permissionService.checkOwnerAccess(documentId, userId);

        document.softDelete();
        documentRepository.save(document);

        activityService.logActivity(documentId, userId, "DELETED", Map.of());

        log.info("Document soft deleted: {} by user: {}", documentId, userId);
    }

    @Transactional(readOnly = true)
    public List<DocumentListItem> searchDocuments(String query, String orgId) {
        List<Document> documents = documentRepository.searchByTitle(query, orgId);
        return documents.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    private DocumentResponse mapToResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .orgId(document.getOrgId())
                .title(document.getTitle())
                .ownerId(document.getOwnerId())
                .content(document.getContent())
                .isTemplate(document.getIsTemplate())
                .isDeleted(document.getIsDeleted())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .deletedAt(document.getDeletedAt())
                .build();
    }

    private DocumentResponse mapToDetailedResponse(Document document) {
        DocumentResponse response = mapToResponse(document);
        response.setCurrentUserRole(permissionService.getUserRole(document.getId(),
                SecurityUtil.getCurrentUserId()).name());
        return response;
    }

    private DocumentListItem mapToListItem(Document document) {
        return DocumentListItem.builder()
                .id(document.getId())
                .title(document.getTitle())
                .ownerId(document.getOwnerId())
                .isTemplate(document.getIsTemplate())
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .currentUserRole(permissionService.getUserRole(document.getId(),
                        SecurityUtil.getCurrentUserId()).name())
                .build();
    }

    private Map<String, Object> buildChangeMap(UpdateDocumentRequest request) {
        Map<String, Object> changes = new HashMap<>();
        if (request.getTitle() != null) changes.put("title", request.getTitle());
        if (request.getContent() != null) changes.put("content", "updated");
        if (request.getIsTemplate() != null) changes.put("isTemplate", request.getIsTemplate());
        return changes;
    }
}
