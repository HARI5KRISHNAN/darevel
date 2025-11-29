package com.darevel.drive.meta.controller;

import com.darevel.drive.meta.dto.CreateFileVersionRequest;
import com.darevel.drive.meta.dto.CreateFolderRequest;
import com.darevel.drive.meta.dto.FileVersionResponse;
import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.dto.NodeSummaryResponse;
import com.darevel.drive.meta.dto.RegisterFileRequest;
import com.darevel.drive.meta.dto.UpdateNodeRequest;
import com.darevel.drive.meta.service.NodeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drive")
@RequiredArgsConstructor
@Validated
public class NodeController {

    private final NodeService nodeService;

    @PostMapping("/nodes/folders")
    public ResponseEntity<NodeResponse> createFolder(@Valid @RequestBody CreateFolderRequest request) {
        NodeResponse response = nodeService.createFolder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/nodes/files")
    public ResponseEntity<NodeResponse> registerFile(@Valid @RequestBody RegisterFileRequest request) {
        NodeResponse response = nodeService.registerFile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/spaces/{spaceId}/nodes")
    public List<NodeSummaryResponse> listNodes(
        @PathVariable UUID spaceId,
        @RequestParam(required = false) UUID parentId,
        @RequestParam @NotNull UUID userId
    ) {
        return nodeService.listNodes(spaceId, parentId, userId);
    }

    @GetMapping("/spaces/{spaceId}/trash")
    public List<NodeSummaryResponse> listTrashedNodes(
        @PathVariable UUID spaceId,
        @RequestParam @NotNull UUID userId
    ) {
        return nodeService.listTrashedNodes(spaceId, userId);
    }

    @GetMapping("/nodes/{nodeId}")
    public NodeResponse getNode(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID userId
    ) {
        return nodeService.getNode(nodeId, userId);
    }

    @PatchMapping("/nodes/{nodeId}")
    public NodeResponse updateNode(
        @PathVariable UUID nodeId,
        @Valid @RequestBody UpdateNodeRequest request
    ) {
        return nodeService.updateNode(nodeId, request);
    }

    @DeleteMapping("/nodes/{nodeId}")
    public ResponseEntity<Void> softDelete(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID actorId
    ) {
        nodeService.softDelete(nodeId, actorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/nodes/{nodeId}/restore")
    public ResponseEntity<Void> restore(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID actorId
    ) {
        nodeService.restore(nodeId, actorId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/nodes/{nodeId}/versions")
    public ResponseEntity<FileVersionResponse> createVersion(
        @PathVariable UUID nodeId,
        @Valid @RequestBody CreateFileVersionRequest request
    ) {
        FileVersionResponse response = nodeService.createVersion(nodeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/nodes/{nodeId}/versions")
    public List<FileVersionResponse> listVersions(@PathVariable UUID nodeId) {
        return nodeService.listVersions(nodeId);
    }

    @GetMapping("/nodes/recent")
    public List<NodeSummaryResponse> listRecentNodes(
        @RequestParam @NotNull UUID ownerId,
        @RequestParam(defaultValue = "20") @Min(1) @Max(50) int limit
    ) {
        return nodeService.listRecentNodes(ownerId, limit);
    }

    @GetMapping("/nodes/starred")
    public List<NodeSummaryResponse> listStarredNodes(@RequestParam @NotNull UUID userId) {
        return nodeService.listStarredNodes(userId);
    }

    @PostMapping("/nodes/{nodeId}/star")
    public ResponseEntity<Void> starNode(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID userId
    ) {
        nodeService.starNode(nodeId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/nodes/{nodeId}/star")
    public ResponseEntity<Void> unstarNode(
        @PathVariable UUID nodeId,
        @RequestParam @NotNull UUID userId
    ) {
        nodeService.unstarNode(nodeId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/spaces/{spaceId}/search")
    public List<NodeSummaryResponse> searchNodes(
        @PathVariable UUID spaceId,
        @RequestParam @NotNull String query,
        @RequestParam @NotNull UUID userId
    ) {
        return nodeService.searchNodes(spaceId, query, userId);
    }
}
