package com.darevel.drive.meta.service;

import com.darevel.drive.meta.domain.DriveFileVersion;
import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.DriveStar;
import com.darevel.drive.meta.domain.NodeType;
import com.darevel.drive.meta.dto.CreateFileVersionRequest;
import com.darevel.drive.meta.dto.CreateFolderRequest;
import com.darevel.drive.meta.dto.FileVersionResponse;
import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.dto.NodeSummaryResponse;
import com.darevel.drive.meta.dto.RegisterFileRequest;
import com.darevel.drive.meta.dto.UpdateNodeRequest;
import com.darevel.drive.meta.event.NodeEvent;
import com.darevel.drive.meta.event.NodeEventType;
import com.darevel.drive.meta.exception.DuplicateNodeNameException;
import com.darevel.drive.meta.exception.InvalidNodeMoveException;
import com.darevel.drive.meta.exception.NodeNotFoundException;
import com.darevel.drive.meta.exception.NodeTrashedException;
import com.darevel.drive.meta.mapper.DriveMapper;
import com.darevel.drive.meta.repository.DriveFileVersionRepository;
import com.darevel.drive.meta.repository.DriveNodeRepository;
import com.darevel.drive.meta.repository.DriveStarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class NodeService {

    private static final int RECENT_MIN_LIMIT = 1;
    private static final int RECENT_MAX_LIMIT = 50;

    private final DriveNodeRepository nodeRepository;
    private final DriveFileVersionRepository versionRepository;
    private final DriveStarRepository starRepository;
    private final DriveMapper driveMapper;
    private final SpaceService spaceService;
    private final NodeEventPublisher eventPublisher;

    @Transactional
    public NodeResponse createFolder(CreateFolderRequest request) {
        spaceService.getSpace(request.spaceId());
        validateParentFolder(request.spaceId(), request.parentId());
        ensureUniqueName(request.spaceId(), request.parentId(), request.name());
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode node = DriveNode.builder()
            .spaceId(request.spaceId())
            .parentId(request.parentId())
            .name(request.name())
            .nodeType(NodeType.FOLDER)
            .mimeType(null)
            .sizeBytes(0)
            .ownerId(request.ownerId())
            .createdAt(now)
            .updatedAt(now)
            .build();
        DriveNode saved = nodeRepository.save(node);
        publishEvent(saved, request.ownerId(), NodeEventType.NODE_CREATED, Map.of("nodeType", NodeType.FOLDER.name()));
        return driveMapper.toNodeResponse(saved, false, List.of());
    }

    @Transactional
    public NodeResponse registerFile(RegisterFileRequest request) {
        spaceService.getSpace(request.spaceId());
        validateParentFolder(request.spaceId(), request.parentId());
        ensureUniqueName(request.spaceId(), request.parentId(), request.name());
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode node = DriveNode.builder()
            .spaceId(request.spaceId())
            .parentId(request.parentId())
            .name(request.name())
            .nodeType(NodeType.FILE)
            .mimeType(request.mimeType())
            .sizeBytes(request.sizeBytes())
            .ownerId(request.ownerId())
            .storageKey(request.storageKey())
            .createdAt(now)
            .updatedAt(now)
            .build();
        DriveNode saved = nodeRepository.save(node);

        DriveFileVersion version = DriveFileVersion.builder()
            .nodeId(saved.getId())
            .versionNumber(1)
            .storageKey(request.storageKey())
            .sizeBytes(request.sizeBytes())
            .checksum(request.checksum())
            .createdBy(request.ownerId())
            .createdAt(now)
            .comment("Initial upload")
            .build();
        DriveFileVersion savedVersion = versionRepository.save(version);
        saved.setCurrentVersionId(savedVersion.getId());
        nodeRepository.save(saved);

        publishEvent(saved, request.ownerId(), NodeEventType.NODE_CREATED, Map.of(
            "nodeType", NodeType.FILE.name(),
            "mimeType", request.mimeType(),
            "sizeBytes", request.sizeBytes()
        ));

        return driveMapper.toNodeResponse(saved, false, List.of(savedVersion));
    }

    @Transactional(readOnly = true)
    public List<NodeSummaryResponse> listNodes(UUID spaceId, UUID parentId, UUID userId) {
        spaceService.getSpace(spaceId);
        List<DriveNode> nodes = parentId == null
            ? nodeRepository.findAllBySpaceIdAndParentIdIsNullAndDeletedAtIsNullOrderByNameAsc(spaceId)
            : nodeRepository.findAllBySpaceIdAndParentIdAndDeletedAtIsNullOrderByNameAsc(spaceId, parentId);
        Set<UUID> starred = findStarredNodeIds(userId);
        return mapToSummaries(nodes, starred);
    }

    @Transactional(readOnly = true)
    public NodeResponse getNode(UUID nodeId, UUID userId) {
        DriveNode node = getActiveNode(nodeId);
        List<DriveFileVersion> versions = versionRepository.findAllByNodeIdOrderByVersionNumberDesc(nodeId);
        boolean starred = userId != null && starRepository.findByNodeIdAndUserId(nodeId, userId).isPresent();
        return driveMapper.toNodeResponse(node, starred, versions);
    }

    @Transactional
    public NodeResponse updateNode(UUID nodeId, UpdateNodeRequest request) {
        DriveNode node = getActiveNode(nodeId);
        boolean parentChanged = false;
        if (request.name() != null && !request.name().equalsIgnoreCase(node.getName())) {
            ensureUniqueName(node.getSpaceId(), node.getParentId(), request.name());
            node.setName(request.name());
        }
        if (request.parentId() != null && !request.parentId().equals(node.getParentId())) {
            if (request.parentId().equals(nodeId)) {
                throw new InvalidNodeMoveException("Cannot move a node into itself");
            }
            validateParentFolder(node.getSpaceId(), request.parentId());
            ensureUniqueName(node.getSpaceId(), request.parentId(), node.getName());
            node.setParentId(request.parentId());
            parentChanged = true;
        }
        if (request.parentId() == null && node.getParentId() != null) {
            ensureUniqueName(node.getSpaceId(), null, node.getName());
            node.setParentId(null);
            parentChanged = true;
        }
        node.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        DriveNode saved = nodeRepository.save(node);
        Map<String, Object> payload = new HashMap<>();
        payload.put("name", saved.getName());
        if (parentChanged) {
            payload.put("parentId", saved.getParentId());
        }
        NodeEventType eventType = parentChanged ? NodeEventType.NODE_MOVED : NodeEventType.NODE_UPDATED;
        publishEvent(saved, request.actorId(), eventType, payload);
        List<DriveFileVersion> versions = versionRepository.findAllByNodeIdOrderByVersionNumberDesc(nodeId);
        boolean starred = starRepository.findByNodeIdAndUserId(nodeId, request.actorId()).isPresent();
        return driveMapper.toNodeResponse(saved, starred, versions);
    }

    @Transactional
    public void softDelete(UUID nodeId, UUID actorId) {
        DriveNode node = getActiveNode(nodeId);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        node.setDeletedAt(now);
        node.setUpdatedAt(now);
        nodeRepository.save(node);
        starRepository.deleteByNodeId(nodeId);
        publishEvent(node, actorId, NodeEventType.NODE_DELETED, Map.of());
    }

    @Transactional
    public void restore(UUID nodeId, UUID actorId) {
        DriveNode node = nodeRepository.findById(nodeId)
            .orElseThrow(() -> new NodeNotFoundException("Node not found: " + nodeId));
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (node.getDeletedAt() == null) {
            return;
        }
        node.setDeletedAt(null);
        node.setUpdatedAt(now);
        nodeRepository.save(node);
        publishEvent(node, actorId, NodeEventType.NODE_RESTORED, Map.of());
    }

    @Transactional
    public FileVersionResponse createVersion(UUID nodeId, CreateFileVersionRequest request) {
        DriveNode node = getActiveNode(nodeId);
        if (node.getNodeType() != NodeType.FILE) {
            throw new InvalidNodeMoveException("Versions can only be added to files");
        }
        long nextVersion = node.getCurrentVersionId() == null
            ? 1
            : versionRepository.findFirstByNodeIdOrderByVersionNumberDesc(nodeId)
                .map(v -> v.getVersionNumber() + 1)
                .orElse(1L);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveFileVersion version = DriveFileVersion.builder()
            .nodeId(nodeId)
            .versionNumber(nextVersion)
            .storageKey(request.storageKey())
            .sizeBytes(request.sizeBytes())
            .checksum(request.checksum())
            .createdBy(request.actorId())
            .createdAt(now)
            .comment(request.comment())
            .build();
        DriveFileVersion savedVersion = versionRepository.save(version);
        node.setStorageKey(request.storageKey());
        node.setSizeBytes(request.sizeBytes());
        node.setCurrentVersionId(savedVersion.getId());
        node.setUpdatedAt(now);
        nodeRepository.save(node);
        publishEvent(node, request.actorId(), NodeEventType.VERSION_CREATED, Map.of("version", nextVersion));
        return driveMapper.toVersionResponse(savedVersion);
    }

    @Transactional
    public void starNode(UUID nodeId, UUID userId) {
        getActiveNode(nodeId);
        starRepository.findByNodeIdAndUserId(nodeId, userId).ifPresentOrElse(
            star -> {},
            () -> {
                starRepository.save(com.darevel.drive.meta.domain.DriveStar.builder()
                    .nodeId(nodeId)
                    .userId(userId)
                    .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
                    .build());
            }
        );
    }

    @Transactional
    public void unstarNode(UUID nodeId, UUID userId) {
        starRepository.findByNodeIdAndUserId(nodeId, userId)
            .ifPresent(starRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<FileVersionResponse> listVersions(UUID nodeId) {
        getActiveNode(nodeId);
        return versionRepository.findAllByNodeIdOrderByVersionNumberDesc(nodeId)
            .stream()
            .map(driveMapper::toVersionResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<NodeSummaryResponse> listTrashedNodes(UUID spaceId, UUID userId) {
        spaceService.getSpace(spaceId);
        List<DriveNode> nodes = nodeRepository.findAllBySpaceIdAndDeletedAtIsNotNullOrderByUpdatedAtDesc(spaceId);
        return mapToSummaries(nodes, findStarredNodeIds(userId));
    }

    @Transactional(readOnly = true)
    public List<NodeSummaryResponse> listRecentNodes(UUID ownerId, int limit) {
        int pageSize = clampRecentLimit(limit);
        List<DriveNode> nodes = nodeRepository
            .findAllByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(ownerId, PageRequest.of(0, pageSize));
        return mapToSummaries(nodes, findStarredNodeIds(ownerId));
    }

    @Transactional(readOnly = true)
    public List<NodeSummaryResponse> listStarredNodes(UUID userId) {
        List<DriveStar> stars = starRepository.findAllByUserId(userId);
        if (stars.isEmpty()) {
            return List.of();
        }
        Set<UUID> starredIds = stars.stream()
            .map(DriveStar::getNodeId)
            .collect(Collectors.toSet());
        List<DriveNode> nodes = StreamSupport
            .stream(nodeRepository.findAllById(starredIds).spliterator(), false)
            .filter(node -> node.getDeletedAt() == null)
            .sorted(Comparator.comparing(DriveNode::getUpdatedAt).reversed())
            .toList();
        return mapToSummaries(nodes, starredIds);
    }

    private DriveNode getActiveNode(UUID nodeId) {
        DriveNode node = nodeRepository.findById(nodeId)
            .orElseThrow(() -> new NodeNotFoundException("Node not found: " + nodeId));
        if (node.getDeletedAt() != null) {
            throw new NodeTrashedException();
        }
        return node;
    }

    private void ensureUniqueName(UUID spaceId, UUID parentId, String name) {
        boolean exists = parentId == null
            ? nodeRepository.existsBySpaceIdAndParentIdIsNullAndNameIgnoreCaseAndDeletedAtIsNull(spaceId, name)
            : nodeRepository.existsBySpaceIdAndParentIdAndNameIgnoreCaseAndDeletedAtIsNull(spaceId, parentId, name);
        if (exists) {
            throw new DuplicateNodeNameException(name);
        }
    }

    private void validateParentFolder(UUID spaceId, UUID parentId) {
        if (parentId == null) {
            return;
        }
        DriveNode parent = getActiveNode(parentId);
        if (parent.getNodeType() != NodeType.FOLDER) {
            throw new InvalidNodeMoveException("Target parent must be a folder");
        }
        if (!parent.getSpaceId().equals(spaceId)) {
            throw new InvalidNodeMoveException("Cannot move node across spaces");
        }
    }

    private void publishEvent(DriveNode node, UUID actorId, NodeEventType type, Map<String, Object> payload) {
        NodeEvent event = new NodeEvent(
            type,
            node.getId(),
            node.getSpaceId(),
            actorId,
            OffsetDateTime.now(ZoneOffset.UTC),
            new HashMap<>(payload)
        );
        eventPublisher.publish(event);
    }

    private List<NodeSummaryResponse> mapToSummaries(List<DriveNode> nodes, Set<UUID> starredNodeIds) {
        return nodes.stream()
            .map(node -> driveMapper.toNodeSummary(node, starredNodeIds.contains(node.getId())))
            .toList();
    }

    private Set<UUID> findStarredNodeIds(UUID userId) {
        if (userId == null) {
            return Set.of();
        }
        return starRepository.findAllByUserId(userId).stream()
            .map(DriveStar::getNodeId)
            .collect(Collectors.toSet());
    }

    private int clampRecentLimit(int requestedLimit) {
        if (requestedLimit < RECENT_MIN_LIMIT) {
            return RECENT_MIN_LIMIT;
        }
        return Math.min(requestedLimit, RECENT_MAX_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<NodeSummaryResponse> searchNodes(UUID spaceId, String query, UUID userId) {
        spaceService.getSpace(spaceId);
        List<DriveNode> nodes = nodeRepository.searchByName(spaceId, query);
        Set<UUID> starred = findStarredNodeIds(userId);
        return mapToSummaries(nodes, starred);
    }
}
