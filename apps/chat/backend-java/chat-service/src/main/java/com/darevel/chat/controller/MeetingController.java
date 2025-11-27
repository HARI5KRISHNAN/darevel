package com.darevel.chat.controller;

import com.darevel.chat.dto.MeetingDTO;
import com.darevel.chat.entity.Meeting.MeetingStatus;
import com.darevel.chat.service.MeetingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    private static final Logger log = LoggerFactory.getLogger(MeetingController.class);

    private final MeetingService meetingService;

    @org.springframework.beans.factory.annotation.Value("${jitsi.base-url:http://localhost:8000}")
    private String jitsiBaseUrl;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    /**
     * Test endpoint to verify JWT token extraction
     */
    @GetMapping("/test-auth")
    public ResponseEntity<Map<String, Object>> testAuth(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        String authHeader = request.getHeader("Authorization");
        result.put("authHeaderPresent", authHeader != null);
        result.put("authHeaderLength", authHeader != null ? authHeader.length() : 0);
        
        com.darevel.chat.util.JwtUtils utils = new com.darevel.chat.util.JwtUtils();
        Long userId = com.darevel.chat.util.JwtUtils.getCurrentUserId();
        String email = com.darevel.chat.util.JwtUtils.getCurrentUserEmail();
        String name = com.darevel.chat.util.JwtUtils.getCurrentUserName();
        
        result.put("extractedUserId", userId);
        result.put("extractedEmail", email);
        result.put("extractedName", name);
        
        log.info("Test auth - Header present: {}, UserId: {}, Email: {}", 
            authHeader != null, userId, email);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Create a new meeting
     */
    @PostMapping
    public ResponseEntity<MeetingDTO> createMeeting(
            @RequestBody MeetingDTO meetingDTO,
            HttpServletRequest request) {
        log.info("Creating meeting: {}", meetingDTO.getTitle());
        
        // Debug: Log Authorization header
        String authHeader = request.getHeader("Authorization");
        log.info("Authorization header present: {}", authHeader != null);
        if (authHeader != null) {
            log.info("Authorization header length: {}", authHeader.length());
            log.info("Authorization header starts with Bearer: {}", authHeader.startsWith("Bearer "));
        }
        
        MeetingDTO created = meetingService.createMeeting(meetingDTO);
        return ResponseEntity.ok(created);
    }

    /**
     * Get meeting by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MeetingDTO> getMeeting(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all meetings for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MeetingDTO>> getMeetingsForUser(@PathVariable Long userId) {
        List<MeetingDTO> meetings = meetingService.getMeetingsForUser(userId);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get upcoming meetings for a user
     */
    @GetMapping("/user/{userId}/upcoming")
    public ResponseEntity<List<MeetingDTO>> getUpcomingMeetings(@PathVariable Long userId) {
        List<MeetingDTO> meetings = meetingService.getUpcomingMeetingsForUser(userId);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get meetings within a date range
     */
    @GetMapping("/range")
    public ResponseEntity<List<MeetingDTO>> getMeetingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<MeetingDTO> meetings = meetingService.getMeetingsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(meetings);
    }

    /**
     * Get meeting by room name
     */
    @GetMapping("/room/{roomName}")
    public ResponseEntity<MeetingDTO> getMeetingByRoom(@PathVariable String roomName) {
        return meetingService.getMeetingByRoomName(roomName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a meeting
     */
    @PutMapping("/{id}")
    public ResponseEntity<MeetingDTO> updateMeeting(
            @PathVariable Long id,
            @RequestBody MeetingDTO meetingDTO) {
        return meetingService.updateMeeting(id, meetingDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update meeting status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<MeetingDTO> updateMeetingStatus(
            @PathVariable Long id,
            @RequestParam MeetingStatus status) {
        return meetingService.updateMeetingStatus(id, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Start a meeting (change status to IN_PROGRESS)
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<MeetingDTO> startMeeting(@PathVariable Long id) {
        return meetingService.updateMeetingStatus(id, MeetingStatus.IN_PROGRESS)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * End a meeting (change status to COMPLETED)
     */
    @PostMapping("/{id}/end")
    public ResponseEntity<MeetingDTO> endMeeting(@PathVariable Long id) {
        return meetingService.updateMeetingStatus(id, MeetingStatus.COMPLETED)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cancel a meeting
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<MeetingDTO> cancelMeeting(@PathVariable Long id) {
        return meetingService.cancelMeeting(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a meeting
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        if (meetingService.deleteMeeting(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get meeting count for a user
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Map<String, Object>> getMeetingCount(@PathVariable Long userId) {
        Long upcomingCount = meetingService.countUpcomingMeetings(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("upcoming", upcomingCount);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a meeting link (without creating a full meeting)
     */
    @PostMapping("/generate-link")
    public ResponseEntity<Map<String, String>> generateMeetingLink(@RequestBody(required = false) Map<String, String> request) {
        String prefix = request != null ? request.getOrDefault("prefix", "darevel") : "darevel";
        String timestamp = Long.toString(System.currentTimeMillis(), 36);
        String random = java.util.UUID.randomUUID().toString().substring(0, 8);
        String roomName = prefix + "-" + timestamp + "-" + random;
        String meetingLink = jitsiBaseUrl + "/" + roomName;

        Map<String, String> response = new HashMap<>();
        response.put("roomName", roomName);
        response.put("meetingLink", meetingLink);
        return ResponseEntity.ok(response);
    }

    /**
     * Check for scheduling conflicts for a user
     */
    @GetMapping("/conflicts")
    public ResponseEntity<List<MeetingDTO>> checkConflicts(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<MeetingDTO> conflicts = meetingService.checkConflicts(userId, startTime, endTime);
        return ResponseEntity.ok(conflicts);
    }

    /**
     * Check for scheduling conflicts for multiple participants
     */
    @PostMapping("/conflicts/check")
    public ResponseEntity<Map<String, Object>> checkParticipantConflicts(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Number> participantIdsRaw = (List<Number>) request.get("participantIds");
        List<Long> participantIds = participantIdsRaw.stream().map(Number::longValue).collect(java.util.stream.Collectors.toList());
        LocalDateTime startTime = LocalDateTime.parse((String) request.get("startTime"));
        LocalDateTime endTime = LocalDateTime.parse((String) request.get("endTime"));

        java.util.Map<Long, List<MeetingDTO>> conflicts = meetingService.checkParticipantConflicts(participantIds, startTime, endTime);

        Map<String, Object> response = new HashMap<>();
        response.put("hasConflicts", !conflicts.isEmpty());
        response.put("conflicts", conflicts);
        return ResponseEntity.ok(response);
    }
}
