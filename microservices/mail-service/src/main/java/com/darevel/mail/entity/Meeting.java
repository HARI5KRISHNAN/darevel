package com.darevel.mail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organizer_id", nullable = false)
    private String organizerId; // User who created the meeting

    @Column(name = "organizer_email", nullable = false)
    private String organizerEmail;

    @Column(name = "organizer_name")
    private String organizerName;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink; // Video conference link

    @Column(name = "attendees", columnDefinition = "TEXT")
    private String attendees; // JSON array of attendee objects with email, name, status

    @Column(name = "agenda", columnDefinition = "TEXT")
    private String agenda;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Meeting notes/minutes

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "scheduled"; // scheduled, in_progress, completed, cancelled

    @Column(name = "is_recurring", nullable = false)
    @Builder.Default
    private Boolean isRecurring = false;

    @Column(name = "recurrence_rule")
    private String recurrenceRule; // RRULE format for recurring meetings

    @Column(name = "reminder_minutes")
    private Integer reminderMinutes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
