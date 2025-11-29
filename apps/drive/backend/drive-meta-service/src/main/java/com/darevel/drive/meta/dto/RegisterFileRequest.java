package com.darevel.drive.meta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RegisterFileRequest(
    @NotNull UUID spaceId,
    UUID parentId,
    @NotBlank String name,
    @NotBlank String mimeType,
    @NotNull Long sizeBytes,
    @NotBlank String storageKey,
    @NotBlank String checksum,
    @NotNull UUID ownerId
) { }
