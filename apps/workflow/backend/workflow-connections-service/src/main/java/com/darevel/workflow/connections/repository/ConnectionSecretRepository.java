package com.darevel.workflow.connections.repository;

import com.darevel.workflow.connections.entity.ConnectionSecretEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectionSecretRepository extends JpaRepository<ConnectionSecretEntity, UUID> {
    List<ConnectionSecretEntity> findByTenantId(String tenantId);
}
