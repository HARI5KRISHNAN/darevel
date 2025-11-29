package com.darevel.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DashboardTeamConfigRepository extends JpaRepository<DashboardTeamConfigEntity, UUID> {
    Optional<DashboardTeamConfigEntity> findByTeamIdAndOrgId(UUID teamId, UUID orgId);
}
