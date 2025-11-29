package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.SpaceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateSpaceRequest(
    @NotNull UUID ownerId,
    @NotBlank String name,
    @NotNull SpaceType type
) { }
