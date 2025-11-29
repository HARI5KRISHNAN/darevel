package com.darevel.drive.meta.event;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record NodeEvent(
    NodeEventType type,
    UUID nodeId,
    UUID spaceId,
    UUID actorId,
    OffsetDateTime occurredAt,
    Map<String, Object> payload
) { }
