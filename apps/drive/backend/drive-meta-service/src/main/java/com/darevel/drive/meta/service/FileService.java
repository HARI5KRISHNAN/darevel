package com.darevel.drive.meta.service;

import com.darevel.drive.meta.domain.DriveFileVersion;
import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.NodeType;
import com.darevel.drive.meta.dto.CreateFileVersionRequest;
import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.dto.RegisterFileRequest;
import com.darevel.drive.meta.exception.NodeNotFoundException;
import com.darevel.drive.meta.repository.DriveFileVersionRepository;
import com.darevel.drive.meta.repository.DriveNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final StorageService storageService;
    private final NodeService nodeService;
    private final DriveNodeRepository nodeRepository;
    private final DriveFileVersionRepository versionRepository;

    @Transactional
    public NodeResponse uploadFile(MultipartFile file, UUID spaceId, UUID parentId, UUID ownerId) {
        log.info("Uploading file: {} to space: {}", file.getOriginalFilename(), spaceId);

        // Upload to MinIO
        StorageService.StorageResult storageResult = storageService.uploadFile(file, spaceId, ownerId);

        // Register file metadata in database
        RegisterFileRequest request = new RegisterFileRequest(
            spaceId,
            parentId,
            file.getOriginalFilename(),
            storageResult.mimeType(),
            storageResult.sizeBytes(),
            storageResult.storageKey(),
            storageResult.checksum(),
            ownerId
        );

        return nodeService.registerFile(request);
    }

    @Transactional
    public NodeResponse uploadNewVersion(UUID nodeId, MultipartFile file, UUID actorId, String comment) {
        log.info("Uploading new version for node: {}", nodeId);

        DriveNode node = nodeRepository.findById(nodeId)
            .orElseThrow(() -> new NodeNotFoundException("Node not found: " + nodeId));

        if (node.getNodeType() != NodeType.FILE) {
            throw new IllegalArgumentException("Cannot upload version for non-file node");
        }

        // Upload to MinIO
        StorageService.StorageResult storageResult = storageService.uploadFile(
            file,
            node.getSpaceId(),
            node.getOwnerId()
        );

        // Create new version
        CreateFileVersionRequest request = new CreateFileVersionRequest(
            storageResult.storageKey(),
            storageResult.sizeBytes(),
            storageResult.checksum(),
            actorId,
            comment != null ? comment : "Uploaded new version"
        );

        nodeService.createVersion(nodeId, request);

        // Return updated node
        return nodeService.getNode(nodeId, actorId);
    }

    @Transactional(readOnly = true)
    public DownloadResult downloadFile(UUID nodeId, UUID userId) {
        log.info("Downloading file node: {} for user: {}", nodeId, userId);

        NodeResponse node = nodeService.getNode(nodeId, userId);

        if (node.nodeType() != NodeType.FILE) {
            throw new IllegalArgumentException("Cannot download non-file node");
        }

        if (node.storageKey() == null) {
            throw new IllegalStateException("File has no storage key");
        }

        InputStream inputStream = storageService.downloadFile(node.storageKey());

        return new DownloadResult(
            inputStream,
            node.name(),
            node.mimeType(),
            node.sizeBytes()
        );
    }

    @Transactional(readOnly = true)
    public DownloadResult downloadFileVersion(UUID nodeId, long versionNumber, UUID userId) {
        log.info("Downloading file node: {} version: {} for user: {}", nodeId, versionNumber, userId);

        NodeResponse node = nodeService.getNode(nodeId, userId);

        if (node.nodeType() != NodeType.FILE) {
            throw new IllegalArgumentException("Cannot download non-file node");
        }

        DriveFileVersion version = versionRepository
            .findByNodeIdAndVersionNumber(nodeId, versionNumber)
            .orElseThrow(() -> new NodeNotFoundException(
                "Version " + versionNumber + " not found for node " + nodeId
            ));

        InputStream inputStream = storageService.downloadFile(version.getStorageKey());

        return new DownloadResult(
            inputStream,
            node.name() + " (v" + versionNumber + ")",
            node.mimeType(),
            version.getSizeBytes()
        );
    }

    public record DownloadResult(
        InputStream inputStream,
        String filename,
        String mimeType,
        long sizeBytes
    ) {}
}
