package com.darevel.billing.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "usage_records")
public class UsageRecordEntity {

    @Id
    private UUID id;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(name = "users_count")
    private Integer usersCount;

    @Column(name = "storage_used_gb")
    private Double storageUsedGb;

    @Column(name = "docs_count")
    private Integer docsCount;

    @Column(name = "files_count")
    private Integer filesCount;

    @Column(name = "emails_sent")
    private Integer emailsSent;

    @Column(name = "recorded_at", nullable = false)
    private LocalDate recordedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (recordedAt == null) {
            recordedAt = LocalDate.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrgId() {
        return orgId;
    }

    public void setOrgId(UUID orgId) {
        this.orgId = orgId;
    }

    public Integer getUsersCount() {
        return usersCount;
    }

    public void setUsersCount(Integer usersCount) {
        this.usersCount = usersCount;
    }

    public Double getStorageUsedGb() {
        return storageUsedGb;
    }

    public void setStorageUsedGb(Double storageUsedGb) {
        this.storageUsedGb = storageUsedGb;
    }

    public Integer getDocsCount() {
        return docsCount;
    }

    public void setDocsCount(Integer docsCount) {
        this.docsCount = docsCount;
    }

    public Integer getFilesCount() {
        return filesCount;
    }

    public void setFilesCount(Integer filesCount) {
        this.filesCount = filesCount;
    }

    public Integer getEmailsSent() {
        return emailsSent;
    }

    public void setEmailsSent(Integer emailsSent) {
        this.emailsSent = emailsSent;
    }

    public LocalDate getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDate recordedAt) {
        this.recordedAt = recordedAt;
    }
}
