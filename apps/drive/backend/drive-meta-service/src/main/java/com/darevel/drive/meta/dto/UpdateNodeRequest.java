package com.darevel.drive.meta.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateNodeRequest(
    String name,
    UUID parentId,
    @NotNull UUID actorId
) { }
