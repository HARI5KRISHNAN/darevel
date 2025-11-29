package com.darevel.admin.dto;

import java.time.OffsetDateTime;

public record ActivityLogEntry(
    OffsetDateTime timestamp,
    String userName,
    String action,
    String resourceType,
    String resourceName
) {}
