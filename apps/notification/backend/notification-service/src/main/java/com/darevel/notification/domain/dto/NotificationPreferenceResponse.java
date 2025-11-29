package com.darevel.notification.domain.dto;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record NotificationPreferenceResponse(
        UUID userId,
        UUID orgId,
        Map<String, Boolean> channels,
        OffsetDateTime muteUntil,
        boolean desktopPushEnabled,
        boolean mobilePushEnabled,
        boolean soundEnabled
) {}
