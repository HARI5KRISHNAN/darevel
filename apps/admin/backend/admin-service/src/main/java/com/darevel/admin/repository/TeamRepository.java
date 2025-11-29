package com.darevel.admin.repository;

import com.darevel.admin.entity.TeamEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<TeamEntity, UUID> {
    Page<TeamEntity> findByOrgId(UUID orgId, Pageable pageable);
    Page<TeamEntity> findByOrgIdAndNameContainingIgnoreCase(UUID orgId, String name, Pageable pageable);
    Optional<TeamEntity> findByOrgIdAndId(UUID orgId, UUID id);
    List<TeamEntity> findByOrgIdAndIdIn(UUID orgId, List<UUID> ids);
}
