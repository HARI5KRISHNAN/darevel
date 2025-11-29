package com.darevel.preview.service;

import com.darevel.preview.dto.PreviewArtifactResponse;
import com.darevel.preview.dto.PreviewFileResponse;
import com.darevel.preview.entity.PreviewArtifactEntity;
import com.darevel.preview.entity.PreviewFileEntity;
import java.util.List;

public final class PreviewMapper {

    private PreviewMapper() {
    }

    public static PreviewFileResponse toResponse(PreviewFileEntity entity, List<PreviewArtifactEntity> artifacts) {
        PreviewFileResponse response = new PreviewFileResponse();
        response.setId(entity.getId());
        response.setFilename(entity.getFilename());
        response.setMimeType(entity.getMimeType());
        response.setSizeBytes(entity.getSizeBytes());
        response.setStatus(entity.getStatus());
        response.setFailureReason(entity.getFailureReason());
        response.setLastGeneratedAt(entity.getLastGeneratedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        response.setExpiresAt(entity.getExpiresAt());
        response.setOrgId(entity.getOrgId());
        response.setOwnerId(entity.getOwnerId());
        response.setArtifacts(artifacts.stream().map(PreviewMapper::toResponse).toList());
        return response;
    }

    public static PreviewArtifactResponse toResponse(PreviewArtifactEntity entity) {
        PreviewArtifactResponse response = new PreviewArtifactResponse();
        response.setId(entity.getId());
        response.setType(entity.getArtifactType());
        response.setStorageKey(entity.getStorageKey());
        response.setByteSize(entity.getByteSize());
        response.setMetadata(entity.getMetadata());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
