package com.darevel.mail.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.mail.dto.CreateMeetingRequest;
import com.darevel.mail.dto.MeetingDTO;
import com.darevel.mail.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;

    /**
     * GET /api/meetings
     * Get all meetings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<MeetingDTO>>> getAllMeetings(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<MeetingDTO> meetings = meetingService.getAllMeetings(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    /**
     * GET /api/meetings/status/{status}
     * Get meetings by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<MeetingDTO>>> getMeetingsByStatus(
            Authentication authentication,
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<MeetingDTO> meetings = meetingService.getMeetingsByStatus(jwt, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    /**
     * GET /api/meetings/range
     * Get meetings by date range
     */
    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getMeetingsByDateRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        List<MeetingDTO> meetings = meetingService.getMeetingsByDateRange(jwt, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    /**
     * GET /api/meetings/{id}
     * Get meeting by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingDTO>> getMeetingById(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        MeetingDTO meeting = meetingService.getMeetingById(jwt, id);
        return ResponseEntity.ok(ApiResponse.success(meeting));
    }

    /**
     * POST /api/meetings
     * Create a new meeting
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MeetingDTO>> createMeeting(
            Authentication authentication,
            @RequestBody CreateMeetingRequest request) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        MeetingDTO meeting = meetingService.createMeeting(jwt, request);
        return ResponseEntity.ok(ApiResponse.success("Meeting created successfully", meeting));
    }

    /**
     * PUT /api/meetings/{id}
     * Update a meeting
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingDTO>> updateMeeting(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CreateMeetingRequest request) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        MeetingDTO meeting = meetingService.updateMeeting(jwt, id, request);
        return ResponseEntity.ok(ApiResponse.success("Meeting updated successfully", meeting));
    }

    /**
     * PATCH /api/meetings/{id}/status
     * Update meeting status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MeetingDTO>> updateMeetingStatus(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String status = body.get("status");
        MeetingDTO meeting = meetingService.updateMeetingStatus(jwt, id, status);
        return ResponseEntity.ok(ApiResponse.success("Meeting status updated", meeting));
    }

    /**
     * PATCH /api/meetings/{id}/notes
     * Update meeting notes
     */
    @PatchMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<MeetingDTO>> updateMeetingNotes(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String notes = body.get("notes");
        MeetingDTO meeting = meetingService.updateMeetingNotes(jwt, id, notes);
        return ResponseEntity.ok(ApiResponse.success("Meeting notes updated", meeting));
    }

    /**
     * DELETE /api/meetings/{id}
     * Delete a meeting
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMeeting(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        meetingService.deleteMeeting(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Meeting deleted successfully", null));
    }

    /**
     * GET /api/meetings/upcoming/count
     * Get upcoming meetings count
     */
    @GetMapping("/upcoming/count")
    public ResponseEntity<ApiResponse<Long>> getUpcomingMeetingsCount(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long count = meetingService.getUpcomingMeetingsCount(jwt);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * GET /api/meetings/search
     * Search meetings
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MeetingDTO>>> searchMeetings(
            Authentication authentication,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<MeetingDTO> meetings = meetingService.searchMeetings(jwt, q, page, size);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }
}
