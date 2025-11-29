package com.darevel.preview.dto;

import com.darevel.preview.domain.PreviewStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PreviewFileResponse {

    private UUID id;
    private String filename;
    private String mimeType;
    private long sizeBytes;
    private PreviewStatus status;
    private String failureReason;
    private Instant lastGeneratedAt;
    private Instant updatedAt;
    private Instant expiresAt;
    private String orgId;
    private String ownerId;
    private List<PreviewArtifactResponse> artifacts = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public PreviewStatus getStatus() {
        return status;
    }

    public void setStatus(PreviewStatus status) {
        this.status = status;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public Instant getLastGeneratedAt() {
        return lastGeneratedAt;
    }

    public void setLastGeneratedAt(Instant lastGeneratedAt) {
        this.lastGeneratedAt = lastGeneratedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getOrgId() {
        return orgId;
    }

    public void setOrgId(String orgId) {
        this.orgId = orgId;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public List<PreviewArtifactResponse> getArtifacts() {
        return artifacts;
    }

    public void setArtifacts(List<PreviewArtifactResponse> artifacts) {
        this.artifacts = artifacts;
    }
}
