package com.darevel.workflow.shared.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class WorkflowRunDto {
    UUID id;
    UUID workflowId;
    Instant startedAt;
    Instant completedAt;
    String status;
    @Builder.Default List<String> logs = List.of();
    String triggerEventId;
    String failureReason;
}
