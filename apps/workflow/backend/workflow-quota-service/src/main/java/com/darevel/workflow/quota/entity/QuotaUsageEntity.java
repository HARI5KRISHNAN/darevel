package com.darevel.workflow.quota.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workflow_quota_usage")
@Getter
@Setter
public class QuotaUsageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "monthly_runs")
    private Long monthlyRuns;

    @Column(name = "run_limit")
    private Long runLimit;

    @Column(name = "reset_at")
    private Instant resetAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
