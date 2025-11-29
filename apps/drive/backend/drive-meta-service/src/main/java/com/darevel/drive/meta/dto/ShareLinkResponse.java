package com.darevel.drive.meta.dto;

import com.darevel.drive.meta.domain.PermissionLevel;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ShareLinkResponse(
    UUID id,
    UUID nodeId,
    String shareToken,
    String shareUrl,
    PermissionLevel permissionLevel,
    UUID createdBy,
    OffsetDateTime createdAt,
    OffsetDateTime expiresAt,
    boolean hasPassword,
    Long downloadCount,
    Long maxDownloads
) {}
