package com.darevel.workflow.run.service;

import com.darevel.workflow.run.entity.WorkflowRunRecordEntity;
import com.darevel.workflow.run.repository.WorkflowRunRecordRepository;
import com.darevel.workflow.shared.dto.WorkflowRunDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkflowRunQueryService {

    private final WorkflowRunRecordRepository repository;

    public Page<WorkflowRunDto> list(UUID workflowId, int page, int size) {
        PageRequest request = PageRequest.of(page, size);
        Page<WorkflowRunRecordEntity> entities = workflowId == null
                ? repository.findAll(request)
                : repository.findByWorkflowId(workflowId, request);
        return entities.map(this::toDto);
    }

    private WorkflowRunDto toDto(WorkflowRunRecordEntity entity) {
        return WorkflowRunDto.builder()
                .id(entity.getId())
                .workflowId(entity.getWorkflowId())
                .status(entity.getStatus())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .logs(java.util.List.of(entity.getLogs()))
                .build();
    }
}
