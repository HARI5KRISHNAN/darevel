package com.darevel.dashboard.dto;

import java.util.List;

public record TeamDashboardResponse(
        String teamName,
        List<TaskDto> sprintTasks,
        List<TaskDto> upcomingDeadlines,
        List<UserSummaryDto> activeMembers,
        List<DocumentDto> teamDocs
) {
}
