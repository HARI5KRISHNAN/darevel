package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceMember;
import jakarta.validation.constraints.NotNull;

public record UpdateSpaceMemberRoleRequest(
    @NotNull SpaceMember.Role role
) { }
