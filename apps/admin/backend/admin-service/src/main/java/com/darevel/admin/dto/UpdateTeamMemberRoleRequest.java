package com.darevel.admin.dto;

import com.darevel.admin.model.TeamRole;
import jakarta.validation.constraints.NotNull;

public record UpdateTeamMemberRoleRequest(@NotNull TeamRole role) {}
