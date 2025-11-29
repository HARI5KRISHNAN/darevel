package com.darevel.wiki.content.dto;

import com.darevel.wiki.content.domain.Block;
import com.darevel.wiki.content.domain.ContentHistory;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response containing content history entry
 */
public record ContentHistoryResponse(
    UUID id,
    UUID pageId,
    List<Block> blocks,
    Long version,
    UUID changedBy,
    Instant changedAt,
    ContentHistory.ChangeType changeType,
    String changeSummary
) {
}
