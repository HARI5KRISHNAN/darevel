package com.darevel.drive.meta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateFileVersionRequest(
    @NotBlank String storageKey,
    @NotNull Long sizeBytes,
    @NotBlank String checksum,
    @NotNull UUID actorId,
    String comment
) { }
