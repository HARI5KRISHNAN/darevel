package com.darevel.workflow.shared.dto;

import com.darevel.workflow.shared.enums.WorkflowStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Value;

@Value
@Builder(toBuilder = true)
public class WorkflowDefinitionDto {
    UUID id;
    @NotBlank String name;
    String description;
    @NotNull WorkflowStatus status;
    @Valid @NotNull WorkflowTriggerDto trigger;
    @Valid @Builder.Default List<WorkflowActionDto> actions = List.of();
    @Builder.Default int version = 1;
    @Builder.Default Instant createdAt = Instant.now();
    @Builder.Default Instant updatedAt = Instant.now();
    String ownerId;
    String organizationId;
}
