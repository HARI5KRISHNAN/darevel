package com.darevel.admin.repository;

import com.darevel.admin.entity.AdminAuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLogEntity, UUID> {
    Page<AdminAuditLogEntity> findByOrgId(UUID orgId, Pageable pageable);
}
