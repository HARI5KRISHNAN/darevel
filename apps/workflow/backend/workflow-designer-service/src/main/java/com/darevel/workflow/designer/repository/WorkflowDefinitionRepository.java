package com.darevel.workflow.designer.repository;

import com.darevel.workflow.designer.entity.WorkflowDefinitionEntity;
import com.darevel.workflow.shared.enums.WorkflowStatus;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinitionEntity, UUID> {
    List<WorkflowDefinitionEntity> findByStatus(WorkflowStatus status);
}
