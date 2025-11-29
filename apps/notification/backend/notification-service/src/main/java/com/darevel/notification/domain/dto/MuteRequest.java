package com.darevel.notification.domain.dto;

import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record MuteRequest(@NotNull OffsetDateTime muteUntil) {
}
