package com.darevel.mail.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.mail.dto.CalendarEventDTO;
import com.darevel.mail.dto.CreateCalendarEventRequest;
import com.darevel.mail.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    /**
     * GET /api/calendar/events
     * Get all calendar events
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<Page<CalendarEventDTO>>> getAllEvents(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<CalendarEventDTO> events = calendarEventService.getAllEvents(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * GET /api/calendar/events/range
     * Get events by date range
     */
    @GetMapping("/events/range")
    public ResponseEntity<ApiResponse<List<CalendarEventDTO>>> getEventsByDateRange(
            Authentication authentication,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        List<CalendarEventDTO> events = calendarEventService.getEventsByDateRange(jwt, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * GET /api/calendar/events/{id}
     * Get event by ID
     */
    @GetMapping("/events/{id}")
    public ResponseEntity<ApiResponse<CalendarEventDTO>> getEventById(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        CalendarEventDTO event = calendarEventService.getEventById(jwt, id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    /**
     * POST /api/calendar/events
     * Create a new calendar event
     */
    @PostMapping("/events")
    public ResponseEntity<ApiResponse<CalendarEventDTO>> createEvent(
            Authentication authentication,
            @RequestBody CreateCalendarEventRequest request) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        CalendarEventDTO event = calendarEventService.createEvent(jwt, request);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", event));
    }

    /**
     * PUT /api/calendar/events/{id}
     * Update a calendar event
     */
    @PutMapping("/events/{id}")
    public ResponseEntity<ApiResponse<CalendarEventDTO>> updateEvent(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody CreateCalendarEventRequest request) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        CalendarEventDTO event = calendarEventService.updateEvent(jwt, id, request);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", event));
    }

    /**
     * PATCH /api/calendar/events/{id}/cancel
     * Cancel an event
     */
    @PatchMapping("/events/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelEvent(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        calendarEventService.cancelEvent(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Event cancelled successfully", null));
    }

    /**
     * DELETE /api/calendar/events/{id}
     * Delete an event permanently
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        calendarEventService.deleteEvent(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Event deleted successfully", null));
    }

    /**
     * GET /api/calendar/events/search
     * Search calendar events
     */
    @GetMapping("/events/search")
    public ResponseEntity<ApiResponse<Page<CalendarEventDTO>>> searchEvents(
            Authentication authentication,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<CalendarEventDTO> events = calendarEventService.searchEvents(jwt, q, page, size);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
}
