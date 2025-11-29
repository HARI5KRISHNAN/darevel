package com.darevel.search.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReindexRequest(
        @NotEmpty(message = "workspaceIds are required") List<String> workspaceIds,
        List<String> documentTypes,
        boolean force) {
}
