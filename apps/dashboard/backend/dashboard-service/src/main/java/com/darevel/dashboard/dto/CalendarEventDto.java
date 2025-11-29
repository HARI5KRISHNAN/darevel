package com.darevel.dashboard.dto;

public record CalendarEventDto(
        String id,
        String title,
        String startTime,
        String endTime,
        Integer attendees,
        String type
) {
}
