package com.darevel.dashboard.dto;

import java.util.List;

public record OrgDashboardResponse(
        List<OrgStatDto> stats,
        List<StorageDto> storageUsage,
        List<ActivitySeriesDto> activityData,
        List<UserSummaryDto> recentSignups
) {
}
