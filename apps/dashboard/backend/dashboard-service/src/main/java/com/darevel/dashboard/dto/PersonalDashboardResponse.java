package com.darevel.dashboard.dto;

import java.util.List;

public record PersonalDashboardResponse(
        List<TaskDto> tasks,
        List<CalendarEventDto> events,
        List<EmailDto> emails,
        List<DocumentDto> recentDocs,
        String greeting
) {
}
