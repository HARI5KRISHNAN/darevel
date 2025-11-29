package com.darevel.wiki.page.event;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

public record PageEvent(
    PageEventType type,
    UUID pageId,
    UUID spaceId,
    String path,
    OffsetDateTime occurredAt,
    Map<String, Object> payload
) { }
