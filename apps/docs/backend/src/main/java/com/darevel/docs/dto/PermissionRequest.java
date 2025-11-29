package com.darevel.docs.dto;

import com.darevel.docs.enums.PermissionRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionRequest {

    private String userId;
    private String teamId;

    @NotNull(message = "Role is required")
    private PermissionRole role;
}
