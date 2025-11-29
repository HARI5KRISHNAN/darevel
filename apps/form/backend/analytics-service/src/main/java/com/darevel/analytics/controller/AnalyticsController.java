package com.darevel.analytics.controller;

import com.darevel.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3002", "http://localhost:3005"})
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/forms/{formId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getFormAnalytics(@PathVariable String formId) {
        return ResponseEntity.ok(analyticsService.getFormAnalytics(formId));
    }

    @GetMapping("/forms/{formId}/range")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getFormAnalyticsByDateRange(
            @PathVariable String formId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        
        return ResponseEntity.ok(analyticsService.getFormAnalyticsByDateRange(formId, start, end));
    }
}
