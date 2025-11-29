package com.darevel.notification.controller;

import com.darevel.notification.domain.dto.MarkAllReadRequest;
import com.darevel.notification.domain.dto.MarkReadRequest;
import com.darevel.notification.domain.dto.NotificationListResponse;
import com.darevel.notification.service.NotificationService;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/list")
    public NotificationListResponse list(@RequestHeader("X-User-Id") UUID userId,
                                         @RequestHeader("X-Org-Id") UUID orgId,
                                         @RequestParam(defaultValue = "20") int limit,
                                         @RequestParam(defaultValue = "0") int offset) {
        return notificationService.list(userId, orgId, limit, offset);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestHeader("X-User-Id") UUID userId) {
        return Map.of("count", notificationService.unreadCount(userId));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<Void> markRead(@RequestHeader("X-User-Id") UUID userId,
                                         @Valid @RequestBody MarkReadRequest request) {
        notificationService.markRead(userId, request.notificationIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllRead(@RequestHeader("X-User-Id") UUID userId,
                                            @RequestHeader("X-Org-Id") UUID orgId,
                                            @RequestBody(required = false) MarkAllReadRequest request) {
        notificationService.markAllRead(userId, orgId);
        return ResponseEntity.ok().build();
    }
}
