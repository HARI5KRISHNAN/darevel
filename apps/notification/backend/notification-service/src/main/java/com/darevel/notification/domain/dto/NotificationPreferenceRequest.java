package com.darevel.notification.domain.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record NotificationPreferenceRequest(
        @NotNull Map<String, Boolean> channels,
        boolean desktopPushEnabled,
        boolean mobilePushEnabled,
        boolean soundEnabled
) {}
