package com.darevel.admin.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OrgSettingsResponse(
    UUID orgId,
    String orgName,
    String timezone,
    String defaultLanguage,
    OffsetDateTime updatedAt
) {}
