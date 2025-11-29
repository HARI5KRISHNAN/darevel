package com.darevel.docs.controller;

import com.darevel.docs.dto.ActivityResponse;
import com.darevel.docs.service.ActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents/{documentId}/activity")
@RequiredArgsConstructor
@Slf4j
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @PathVariable UUID documentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("Getting activities for document: {}", documentId);
        List<ActivityResponse> activities = activityService.getActivities(documentId, page, size);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityResponse>> getRecentActivities(
            @PathVariable UUID documentId,
            @RequestParam(defaultValue = "24") int hours) {
        log.info("Getting recent activities for document: {} (last {} hours)", documentId, hours);
        List<ActivityResponse> activities = activityService.getRecentActivities(documentId, hours);
        return ResponseEntity.ok(activities);
    }
}
