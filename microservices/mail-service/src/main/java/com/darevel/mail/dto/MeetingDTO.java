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
public class MeetingDTO {
    private Long id;
    private String organizerEmail;
    private String organizerName;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String meetingLink;
    private List<AttendeeDTO> attendees;
    private String agenda;
    private String notes;
    private String status;
    private Boolean isRecurring;
    private String recurrenceRule;
    private Integer reminderMinutes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendeeDTO {
        private String email;
        private String name;
        private String status; // accepted, declined, tentative, pending
    }
}
