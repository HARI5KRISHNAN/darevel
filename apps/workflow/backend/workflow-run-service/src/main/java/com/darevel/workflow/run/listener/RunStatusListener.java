package com.darevel.workflow.run.listener;

import com.darevel.workflow.run.entity.WorkflowRunRecordEntity;
import com.darevel.workflow.run.repository.WorkflowRunRecordRepository;
import com.darevel.workflow.shared.dto.WorkflowRunDto;
import com.darevel.workflow.shared.messaging.KafkaTopics;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RunStatusListener {

    private final WorkflowRunRecordRepository repository;

    @KafkaListener(topics = KafkaTopics.WORKFLOW_RUN_STATUS, groupId = "workflow-run-service", containerFactory = "workflowRunListenerFactory")
    public void consumeStatus(WorkflowRunDto dto) {
        WorkflowRunRecordEntity entity = new WorkflowRunRecordEntity();
        entity.setId(dto.getId());
        entity.setWorkflowId(dto.getWorkflowId());
        entity.setStatus(dto.getStatus());
        entity.setStartedAt(dto.getStartedAt());
        entity.setCompletedAt(dto.getCompletedAt());
        if (dto.getStartedAt() != null && dto.getCompletedAt() != null) {
            entity.setDurationMs(Duration.between(dto.getStartedAt(), dto.getCompletedAt()).toMillis());
        }
        entity.setLogs(String.join("\n", dto.getLogs()));
        repository.save(entity);
        log.debug("Stored run status for {}", dto.getId());
    }
}
