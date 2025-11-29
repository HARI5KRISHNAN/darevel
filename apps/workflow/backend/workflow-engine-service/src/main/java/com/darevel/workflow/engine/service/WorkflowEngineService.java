package com.darevel.workflow.engine.service;

import com.darevel.workflow.engine.entity.WorkflowRunEntity;
import com.darevel.workflow.engine.entity.WorkflowRunEntity.RunStatus;
import com.darevel.workflow.engine.repository.WorkflowRunRepository;
import com.darevel.workflow.shared.events.WorkflowExecutionEvent;
import com.darevel.workflow.shared.messaging.KafkaTopics;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowEngineService {

    private final WorkflowRunRepository repository;
    private final KafkaTemplate<String, WorkflowExecutionEvent> kafkaTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public UUID startRun(WorkflowExecutionEvent event) {
        WorkflowRunEntity entity = new WorkflowRunEntity();
        entity.setWorkflowId(event.getWorkflowId());
        entity.setStatus(RunStatus.CREATED);
        entity.setTriggerEventId(event.getTrigger().getType().name());
        entity.setStartedAt(Instant.now());
        entity.setLogs(writeLogs("Run created"));
        entity.setTenantId(event.getTenantId());

        WorkflowRunEntity saved = repository.save(entity);
        kafkaTemplate.send(KafkaTopics.WORKFLOW_EXECUTIONS, saved.getWorkflowId().toString(), event);
        log.info("Enqueued workflow {} run {}", event.getWorkflowId(), saved.getId());
        return saved.getId();
    }

    @Transactional
    public void markRun(UUID runId, RunStatus status, String logLine) {
        WorkflowRunEntity entity = repository.findById(runId)
                .orElseThrow(() -> new IllegalArgumentException("Run not found"));
        entity.setStatus(status);
        entity.setLogs(writeLogs(logLine));
        if (status == RunStatus.COMPLETED || status == RunStatus.FAILED) {
            entity.setCompletedAt(Instant.now());
        }
        repository.save(entity);
    }

    private String writeLogs(String line) {
        try {
            return objectMapper.writeValueAsString(new String[] {line});
        } catch (JsonProcessingException e) {
            return "[\"" + line + "\"]";
        }
    }
}
