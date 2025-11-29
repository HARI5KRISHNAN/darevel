package com.darevel.admin.dto;

import com.darevel.admin.model.TeamRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddTeamMemberRequest(
    @NotNull UUID userId,
    TeamRole role
) {}
