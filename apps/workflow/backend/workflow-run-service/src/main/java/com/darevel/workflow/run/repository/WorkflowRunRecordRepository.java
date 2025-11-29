package com.darevel.workflow.run.repository;

import com.darevel.workflow.run.entity.WorkflowRunRecordEntity;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

public interface WorkflowRunRecordRepository extends PagingAndSortingRepository<WorkflowRunRecordEntity, UUID> {
    WorkflowRunRecordEntity save(WorkflowRunRecordEntity entity);
    Page<WorkflowRunRecordEntity> findByWorkflowId(UUID workflowId, Pageable pageable);
}
