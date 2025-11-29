package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSpaceRequest(
    @NotBlank String name,
    String description,
    @NotNull SpaceVisibility visibility
) { }
