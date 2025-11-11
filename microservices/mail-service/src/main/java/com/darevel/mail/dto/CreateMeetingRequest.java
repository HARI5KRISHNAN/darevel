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
public class CreateMeetingRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String meetingLink;
    private List<MeetingDTO.AttendeeDTO> attendees;
    private String agenda;
    private Boolean isRecurring;
    private String recurrenceRule;
    private Integer reminderMinutes;
}
