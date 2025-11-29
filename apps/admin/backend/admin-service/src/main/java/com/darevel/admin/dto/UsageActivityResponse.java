package com.darevel.admin.dto;

import java.util.List;
import java.util.UUID;

public record UsageActivityResponse(
    UUID orgId,
    List<ActivityBucket> buckets
) {
    public record ActivityBucket(String label, long events) {}
}
