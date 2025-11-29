package com.darevel.drive.meta.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record FileVersionResponse(
    UUID id,
    long versionNumber,
    String storageKey,
    long sizeBytes,
    String checksum,
    UUID createdBy,
    OffsetDateTime createdAt,
    String comment
) { }
