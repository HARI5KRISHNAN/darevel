package com.darevel.access.controller.dto;

import com.darevel.access.model.enums.SubjectType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ResourcePermissionResponse(
        UUID id,
        UUID subjectId,
        SubjectType subjectType,
        String permissionCode,
        OffsetDateTime grantedAt,
        UUID grantedBy) {}
