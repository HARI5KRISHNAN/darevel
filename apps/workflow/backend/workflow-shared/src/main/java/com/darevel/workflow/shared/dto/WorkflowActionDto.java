package com.darevel.workflow.shared.dto;

import com.darevel.workflow.shared.enums.ActionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class WorkflowActionDto {
    @NotBlank String id;
    @NotNull ActionType type;
    @Builder.Default Map<String, Object> config = Map.of();
    String label;
    boolean critical;
}
