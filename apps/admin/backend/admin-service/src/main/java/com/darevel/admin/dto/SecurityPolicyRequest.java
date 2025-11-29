package com.darevel.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SecurityPolicyRequest(
    @NotNull Boolean mfaRequired,
    @Min(6) @Max(128) int passwordMinLength,
    @NotNull Boolean passwordRequiresSpecial,
    @NotNull Boolean passwordRequiresNumber,
    @Min(5) @Max(240) int sessionTimeoutMinutes,
    List<String> allowedIpRanges
) {}
