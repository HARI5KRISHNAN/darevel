package com.darevel.access.controller.dto;

import com.darevel.access.model.enums.AssignmentSource;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TeamAssignmentRequest(
        @NotNull UUID teamId,
        @NotNull UUID roleId,
        AssignmentSource source) {

    public AssignmentSource effectiveSource() {
        return source == null ? AssignmentSource.MANUAL : source;
    }
}
