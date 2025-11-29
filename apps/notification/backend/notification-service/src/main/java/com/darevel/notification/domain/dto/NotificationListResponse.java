package com.darevel.notification.domain.dto;

import java.util.List;

public record NotificationListResponse(
        List<NotificationResponse> data,
        long total,
        int limit,
        int offset
) {}
