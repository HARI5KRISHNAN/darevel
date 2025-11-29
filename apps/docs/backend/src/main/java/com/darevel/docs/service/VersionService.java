package com.darevel.docs.service;

import com.darevel.docs.dto.CreateVersionRequest;
import com.darevel.docs.dto.VersionResponse;
import com.darevel.docs.entity.Document;
import com.darevel.docs.entity.DocumentVersion;
import com.darevel.docs.repository.DocumentRepository;
import com.darevel.docs.repository.DocumentVersionRepository;
import com.darevel.docs.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VersionService {

    private final DocumentVersionRepository versionRepository;
    private final DocumentRepository documentRepository;
    private final PermissionService permissionService;
    private final ActivityService activityService;

    @Transactional
    public VersionResponse createVersion(UUID documentId, CreateVersionRequest request) {
        String userId = SecurityUtil.getCurrentUserId();
        String userName = SecurityUtil.getCurrentUserName();

        permissionService.checkEditAccess(documentId, userId);

        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        DocumentVersion version = DocumentVersion.builder()
                .document(document)
                .createdBy(userId)
                .snapshot(document.getContent())
                .description(request.getDescription())
                .build();

        version = versionRepository.save(version);

        activityService.logActivity(documentId, userId, "VERSION_CREATED",
                Map.of("versionNumber", version.getVersionNumber()));

        log.info("Version created for document: {}, version: {}", documentId, version.getVersionNumber());
        return mapToResponse(version);
    }

    @Transactional(readOnly = true)
    public List<VersionResponse> getVersions(UUID documentId) {
        permissionService.checkAccess(documentId, SecurityUtil.getCurrentUserId());

        List<DocumentVersion> versions = versionRepository
                .findByDocumentIdOrderByVersionNumberDesc(documentId);

        return versions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VersionResponse getVersion(UUID documentId, Integer versionNumber) {
        permissionService.checkAccess(documentId, SecurityUtil.getCurrentUserId());

        DocumentVersion version = versionRepository
                .findByDocumentIdAndVersionNumber(documentId, versionNumber)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        return mapToResponse(version);
    }

    @Transactional
    public void restoreVersion(UUID documentId, Integer versionNumber) {
        String userId = SecurityUtil.getCurrentUserId();

        permissionService.checkEditAccess(documentId, userId);

        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        DocumentVersion version = versionRepository
                .findByDocumentIdAndVersionNumber(documentId, versionNumber)
                .orElseThrow(() -> new RuntimeException("Version not found"));

        document.setContent(version.getSnapshot());
        documentRepository.save(document);

        activityService.logActivity(documentId, userId, "VERSION_RESTORED",
                Map.of("versionNumber", versionNumber));

        log.info("Version {} restored for document: {}", versionNumber, documentId);
    }

    private VersionResponse mapToResponse(DocumentVersion version) {
        return VersionResponse.builder()
                .id(version.getId())
                .documentId(version.getDocument().getId())
                .versionNumber(version.getVersionNumber())
                .createdBy(version.getCreatedBy())
                .snapshot(version.getSnapshot())
                .snapshotUrl(version.getSnapshotUrl())
                .description(version.getDescription())
                .createdAt(version.getCreatedAt())
                .build();
    }
}
