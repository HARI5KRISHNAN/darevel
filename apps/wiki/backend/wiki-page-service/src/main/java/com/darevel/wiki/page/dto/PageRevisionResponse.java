package com.darevel.wiki.page.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record PageRevisionResponse(
    UUID id,
    long number,
    UUID authorId,
    String summary,
    String content,
    OffsetDateTime createdAt
) { }
