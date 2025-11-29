package com.darevel.workflow.quota.repository;

import com.darevel.workflow.quota.entity.QuotaUsageEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotaUsageRepository extends JpaRepository<QuotaUsageEntity, UUID> {
    Optional<QuotaUsageEntity> findByTenantId(String tenantId);
}
