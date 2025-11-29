package com.darevel.dashboard.repository;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "dashboard_team_configs")
@Getter
@Setter
@NoArgsConstructor
public class DashboardTeamConfigEntity {

    @Id
    private UUID id;

    @Column(name = "team_id", nullable = false)
    private UUID teamId;

    @Column(name = "org_id", nullable = false)
    private UUID orgId;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String layout;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
