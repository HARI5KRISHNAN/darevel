package com.darevel.mail.controller;

import com.darevel.mail.dto.MeetingDTO;
import com.darevel.mail.service.CalendarService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mail/calendar")
public class CalendarController {

    private static final Logger log = LoggerFactory.getLogger(CalendarController.class);

    @Autowired
    private CalendarService calendarService;

    // For development, use a default user. In production, extract from Keycloak token
    private String getUserEmail(String authHeader) {
        // TODO: Implement Keycloak token parsing
        return "testuser@darevel.local";
    }

    @PostMapping("/meetings")
    public ResponseEntity<Map<String, Object>> createMeeting(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String userEmail = getUserEmail(auth);

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String scheduledAtStr = (String) body.get("scheduled_at");
        Integer duration = body.get("duration") != null ? ((Number) body.get("duration")).intValue() : 60;
        String roomName = (String) body.get("room_name");

        if (title == null || scheduledAtStr == null || roomName == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "Missing required fields: title, scheduled_at, room_name");
            return ResponseEntity.badRequest().body(response);
        }

        LocalDateTime scheduledAt;
        try {
            scheduledAt = LocalDateTime.parse(scheduledAtStr.replace("Z", "").replace(" ", "T"));
        } catch (DateTimeParseException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "Invalid scheduled_at format");
            return ResponseEntity.badRequest().body(response);
        }

        log.info("Creating meeting: {} for {}", title, userEmail);
        MeetingDTO meeting = calendarService.createMeeting(userEmail, title, description, scheduledAt, duration, roomName);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("meeting", meeting);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/meetings")
    public ResponseEntity<Map<String, Object>> getMeetings(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String userEmail = getUserEmail(auth);
        List<MeetingDTO> meetings = calendarService.getMeetings(userEmail);

        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("meetings", meetings);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/meetings/{id}")
    public ResponseEntity<Map<String, Object>> getMeetingById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String userEmail = getUserEmail(auth);
        return calendarService.getMeetingById(id, userEmail)
                .map(meeting -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("meeting", meeting);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Meeting not found");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @PatchMapping("/meetings/{id}")
    public ResponseEntity<Map<String, Object>> updateMeeting(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String userEmail = getUserEmail(auth);

        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String scheduledAtStr = (String) body.get("scheduled_at");
        Integer duration = body.get("duration") != null ? ((Number) body.get("duration")).intValue() : null;
        String status = (String) body.get("status");
        String recordingUrl = (String) body.get("recording_url");

        LocalDateTime scheduledAt = null;
        if (scheduledAtStr != null) {
            try {
                scheduledAt = LocalDateTime.parse(scheduledAtStr.replace("Z", "").replace(" ", "T"));
            } catch (DateTimeParseException e) {
                // ignore invalid format
            }
        }

        return calendarService.updateMeeting(id, userEmail, title, description, scheduledAt, duration, status, recordingUrl)
                .map(meeting -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("meeting", meeting);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Meeting not found");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @DeleteMapping("/meetings/{id}")
    public ResponseEntity<Map<String, Object>> deleteMeeting(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String userEmail = getUserEmail(auth);
        boolean deleted = calendarService.deleteMeeting(id, userEmail);

        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            log.info("Meeting {} deleted by {}", id, userEmail);
            response.put("ok", true);
            response.put("message", "Meeting deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("ok", false);
            response.put("error", "Meeting not found");
            return ResponseEntity.status(404).body(response);
        }
    }

    @PostMapping("/meetings/{id}/join")
    public ResponseEntity<Map<String, Object>> joinMeeting(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String userEmail = getUserEmail(auth);
        return calendarService.joinMeeting(id, userEmail)
                .map(meeting -> {
                    log.info("User {} joined meeting {}", userEmail, id);
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("meeting", meeting);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Meeting not found");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @PostMapping("/meetings/{id}/end")
    public ResponseEntity<Map<String, Object>> endMeeting(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String userEmail = getUserEmail(auth);
        return calendarService.endMeeting(id, userEmail)
                .map(meeting -> {
                    log.info("Meeting {} ended. Recording URL: {}", id, meeting.getRecordingUrl());
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("meeting", meeting);
                    response.put("recordingUrl", meeting.getRecordingUrl());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Meeting not found");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @PatchMapping("/meetings/{id}/recording")
    public ResponseEntity<Map<String, Object>> updateRecording(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String userEmail = getUserEmail(auth);
        String recordingUrl = (String) body.get("recording_url");

        if (recordingUrl == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "recording_url is required");
            return ResponseEntity.badRequest().body(response);
        }

        return calendarService.updateRecording(id, userEmail, recordingUrl)
                .map(meeting -> {
                    log.info("Recording URL updated for meeting {}: {}", id, recordingUrl);
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("meeting", meeting);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Meeting not found");
                    return ResponseEntity.status(404).body(response);
                });
    }
}
