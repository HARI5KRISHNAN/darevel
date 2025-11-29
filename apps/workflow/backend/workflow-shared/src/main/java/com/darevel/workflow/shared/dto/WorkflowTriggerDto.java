package com.darevel.workflow.shared.dto;

import com.darevel.workflow.shared.enums.TriggerType;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class WorkflowTriggerDto {
    @NotNull TriggerType type;
    @Builder.Default Map<String, Object> conditions = Map.of();
}
