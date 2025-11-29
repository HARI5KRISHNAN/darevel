package com.darevel.wiki.space.event;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record SpaceEvent(
    SpaceEventType type,
    UUID spaceId,
    String spaceKey,
    OffsetDateTime occurredAt,
    Map<String, Object> payload
) { }
