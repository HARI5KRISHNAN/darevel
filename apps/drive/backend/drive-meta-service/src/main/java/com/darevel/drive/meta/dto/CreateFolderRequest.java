package com.darevel.drive.meta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateFolderRequest(
    @NotNull UUID spaceId,
    UUID parentId,
    @NotBlank String name,
    @NotNull UUID ownerId
) { }
