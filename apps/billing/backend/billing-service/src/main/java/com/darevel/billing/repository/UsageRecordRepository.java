package com.darevel.billing.repository;

import com.darevel.billing.model.entity.UsageRecordEntity;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsageRecordRepository extends JpaRepository<UsageRecordEntity, UUID> {

    List<UsageRecordEntity> findByOrgIdOrderByRecordedAtDesc(UUID orgId);

    Optional<UsageRecordEntity> findFirstByOrgIdOrderByRecordedAtDesc(UUID orgId);

    List<UsageRecordEntity> findByRecordedAt(LocalDate recordedAt);
}
