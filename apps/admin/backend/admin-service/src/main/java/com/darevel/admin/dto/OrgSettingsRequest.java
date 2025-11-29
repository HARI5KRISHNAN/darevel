package com.darevel.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrgSettingsRequest(
    @NotBlank @Size(max = 120) String orgName,
    @Size(max = 64) String timezone,
    @Size(max = 32) String defaultLanguage
) {}
