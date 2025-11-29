package com.darevel.admin.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record SecurityPolicyResponse(
    UUID orgId,
    boolean mfaRequired,
    int passwordMinLength,
    boolean passwordRequiresSpecial,
    boolean passwordRequiresNumber,
    int sessionTimeoutMinutes,
    List<String> allowedIpRanges,
    OffsetDateTime updatedAt
) {}
