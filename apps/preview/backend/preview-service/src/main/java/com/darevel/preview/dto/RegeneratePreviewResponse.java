package com.darevel.preview.dto;

import java.time.Instant;
import java.util.UUID;

public class RegeneratePreviewResponse {

    private UUID jobId;
    private Instant enqueuedAt;

    public RegeneratePreviewResponse(UUID jobId, Instant enqueuedAt) {
        this.jobId = jobId;
        this.enqueuedAt = enqueuedAt;
    }

    public UUID getJobId() {
        return jobId;
    }

    public Instant getEnqueuedAt() {
        return enqueuedAt;
    }
}
