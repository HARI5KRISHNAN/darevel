package com.darevel.preview.entity;

import com.darevel.preview.domain.PreviewJobStatus;
import com.darevel.preview.domain.PreviewJobType;
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
@Table(name = "preview_jobs", schema = "preview_cache")
public class PreviewJobEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preview_file_id", nullable = false)
    private PreviewFileEntity previewFile;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false)
    private PreviewJobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PreviewJobStatus status = PreviewJobStatus.QUEUED;

    @Column(name = "attempt")
    private int attempt;

    @Column(name = "worker_node")
    private String workerNode;

    @Column(name = "error_stack", columnDefinition = "TEXT")
    private String errorStack;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    public UUID getId() {
        return id;
    }

    public PreviewFileEntity getPreviewFile() {
        return previewFile;
    }

    public void setPreviewFile(PreviewFileEntity previewFile) {
        this.previewFile = previewFile;
    }

    public PreviewJobType getJobType() {
        return jobType;
    }

    public void setJobType(PreviewJobType jobType) {
        this.jobType = jobType;
    }

    public PreviewJobStatus getStatus() {
        return status;
    }

    public void setStatus(PreviewJobStatus status) {
        this.status = status;
    }

    public int getAttempt() {
        return attempt;
    }

    public void setAttempt(int attempt) {
        this.attempt = attempt;
    }

    public String getWorkerNode() {
        return workerNode;
    }

    public void setWorkerNode(String workerNode) {
        this.workerNode = workerNode;
    }

    public String getErrorStack() {
        return errorStack;
    }

    public void setErrorStack(String errorStack) {
        this.errorStack = errorStack;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(Instant finishedAt) {
        this.finishedAt = finishedAt;
    }
}
