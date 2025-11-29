package com.darevel.dashboard.dto;

public record EmailDto(
        String id,
        String subject,
        String sender,
        String senderAvatar,
        String preview,
        String timestamp,
        boolean isUnread
) {
}
