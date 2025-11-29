package com.darevel.workflow.engine.repository;

import com.darevel.workflow.engine.entity.WorkflowRunEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowRunRepository extends JpaRepository<WorkflowRunEntity, UUID> {
}
