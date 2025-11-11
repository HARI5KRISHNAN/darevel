package com.darevel.mail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean allDay;
    private String color;
    private List<String> attendees;
    private String recurrenceRule;
    private Integer reminderMinutes;
    private Boolean isCancelled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
