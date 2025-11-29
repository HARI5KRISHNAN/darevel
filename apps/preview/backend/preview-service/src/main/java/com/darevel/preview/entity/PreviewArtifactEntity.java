package com.darevel.preview.entity;

import com.darevel.preview.domain.PreviewArtifactType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "preview_artifacts", schema = "preview_cache")
public class PreviewArtifactEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preview_file_id", nullable = false)
    private PreviewFileEntity previewFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "artifact_type", nullable = false)
    private PreviewArtifactType artifactType;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "byte_size")
    private long byteSize;

    @Column(name = "checksum")
    private String checksum;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() {
        return id;
    }

    public PreviewFileEntity getPreviewFile() {
        return previewFile;
    }

    public void setPreviewFile(PreviewFileEntity previewFile) {
        this.previewFile = previewFile;
    }

    public PreviewArtifactType getArtifactType() {
        return artifactType;
    }

    public void setArtifactType(PreviewArtifactType artifactType) {
        this.artifactType = artifactType;
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

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
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
}
