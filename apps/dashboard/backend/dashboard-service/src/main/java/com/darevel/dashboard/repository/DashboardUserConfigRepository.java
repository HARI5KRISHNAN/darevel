package com.darevel.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DashboardUserConfigRepository extends JpaRepository<DashboardUserConfigEntity, UUID> {
    Optional<DashboardUserConfigEntity> findByUserIdAndOrgId(UUID userId, UUID orgId);
}
