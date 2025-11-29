package com.darevel.admin.repository;

import com.darevel.admin.entity.OrgSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrgSettingsRepository extends JpaRepository<OrgSettingsEntity, UUID> {
    Optional<OrgSettingsEntity> findByOrgId(UUID orgId);
}
