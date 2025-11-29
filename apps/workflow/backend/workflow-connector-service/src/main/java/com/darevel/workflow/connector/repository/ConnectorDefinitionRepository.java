package com.darevel.workflow.connector.repository;

import com.darevel.workflow.connector.entity.ConnectorDefinitionEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectorDefinitionRepository extends JpaRepository<ConnectorDefinitionEntity, UUID> {
    Optional<ConnectorDefinitionEntity> findBySlug(String slug);
}
