package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceMember;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddSpaceMemberRequest(
    @NotNull UUID userId,
    @NotNull SpaceMember.Role role,
    UUID invitedBy
) { }
