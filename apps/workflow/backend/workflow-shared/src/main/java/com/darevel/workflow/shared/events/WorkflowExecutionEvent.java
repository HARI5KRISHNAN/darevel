package com.darevel.workflow.shared.events;

import com.darevel.workflow.shared.dto.WorkflowActionDto;
import com.darevel.workflow.shared.dto.WorkflowTriggerDto;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class WorkflowExecutionEvent {
    UUID runId;
    UUID workflowId;
    WorkflowTriggerDto trigger;
    List<WorkflowActionDto> actions;
    Instant createdAt;
    String tenantId;
    String priority;
}
