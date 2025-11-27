package com.darevel.mail.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDTO {
    private Long id;
    private String title;
    private String description;

    @JsonProperty("scheduled_at")
    private LocalDateTime scheduledAt;

    private Integer duration;

    @JsonProperty("room_name")
    private String roomName;

    @JsonProperty("organizer_email")
    private String organizerEmail;

    private String status;

    @JsonProperty("recording_url")
    private String recordingUrl;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
