package com.darevel.wiki.space.dto;

import com.darevel.wiki.space.domain.SpaceVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateSpaceRequest(
    @NotBlank @Size(max = 16) @Pattern(regexp = "[A-Z0-9-_]+") String key,
    @NotBlank String name,
    String description,
    @NotNull SpaceVisibility visibility,
    @NotNull UUID ownerId
) { }
