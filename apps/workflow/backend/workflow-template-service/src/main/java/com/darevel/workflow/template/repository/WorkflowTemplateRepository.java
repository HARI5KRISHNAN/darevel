package com.darevel.workflow.template.repository;

import com.darevel.workflow.template.entity.WorkflowTemplateEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplateEntity, UUID> {
}
