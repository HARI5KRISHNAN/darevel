package com.darevel.billing.repository;

import com.darevel.billing.model.entity.PlanEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<PlanEntity, UUID> {

    Optional<PlanEntity> findByNameIgnoreCase(String name);
}
