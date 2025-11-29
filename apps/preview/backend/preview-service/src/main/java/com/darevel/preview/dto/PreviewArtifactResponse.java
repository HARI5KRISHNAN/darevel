package com.darevel.preview.dto;

import com.darevel.preview.domain.PreviewArtifactType;
import java.time.Instant;
import java.util.UUID;

public class PreviewArtifactResponse {

    private UUID id;
    private PreviewArtifactType type;
    private String storageKey;
    private long byteSize;
    private String metadata;
    private Instant createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public PreviewArtifactType getType() {
        return type;
    }

    public void setType(PreviewArtifactType type) {
        this.type = type;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public long getByteSize() {
        return byteSize;
    }

    public void setByteSize(long byteSize) {
        this.byteSize = byteSize;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
