package com.darevel.drive.meta.mapper;

import com.darevel.drive.meta.domain.DriveFileVersion;
import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.dto.FileVersionResponse;
import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.dto.NodeSummaryResponse;
import com.darevel.drive.meta.dto.SpaceResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DriveMapper {

    SpaceResponse toSpaceResponse(DriveSpace space);

    default NodeResponse toNodeResponse(DriveNode node, boolean starred, List<DriveFileVersion> versions) {
        return new NodeResponse(
            node.getId(),
            node.getSpaceId(),
            node.getParentId(),
            node.getName(),
            node.getNodeType(),
            node.getMimeType(),
            node.getSizeBytes(),
            node.getOwnerId(),
            node.getStorageKey(),
            node.getDeletedAt(),
            node.getCreatedAt(),
            node.getUpdatedAt(),
            starred,
            versions.stream().map(this::toVersionResponse).toList()
        );
    }

    default NodeSummaryResponse toNodeSummary(DriveNode node, boolean starred) {
        return new NodeSummaryResponse(
            node.getId(),
            node.getSpaceId(),
            node.getParentId(),
            node.getName(),
            node.getNodeType(),
            node.getMimeType(),
            node.getSizeBytes(),
            node.getOwnerId(),
            node.getUpdatedAt(),
            starred,
            node.getDeletedAt() != null
        );
    }

    default FileVersionResponse toVersionResponse(DriveFileVersion version) {
        return new FileVersionResponse(
            version.getId(),
            version.getVersionNumber(),
            version.getStorageKey(),
            version.getSizeBytes(),
            version.getChecksum(),
            version.getCreatedBy(),
            version.getCreatedAt(),
            version.getComment()
        );
    }
}
