package com.darevel.notification.controller;

import com.darevel.notification.domain.dto.MuteRequest;
import com.darevel.notification.domain.dto.NotificationPreferenceRequest;
import com.darevel.notification.domain.dto.NotificationPreferenceResponse;
import com.darevel.notification.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications/preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    public NotificationPreferenceController(NotificationPreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @GetMapping
    public NotificationPreferenceResponse get(@RequestHeader("X-User-Id") UUID userId,
                                              @RequestHeader("X-Org-Id") UUID orgId) {
        return preferenceService.get(userId, orgId);
    }

    @PostMapping
    public NotificationPreferenceResponse update(@RequestHeader("X-User-Id") UUID userId,
                                                 @RequestHeader("X-Org-Id") UUID orgId,
                                                 @Valid @RequestBody NotificationPreferenceRequest request) {
        return preferenceService.update(userId, orgId, request);
    }

    @PostMapping("/mute")
    public NotificationPreferenceResponse mute(@RequestHeader("X-User-Id") UUID userId,
                                               @RequestHeader("X-Org-Id") UUID orgId,
                                               @Valid @RequestBody MuteRequest request) {
        return preferenceService.mute(userId, orgId, request.muteUntil());
    }

    @PostMapping("/unmute")
    public NotificationPreferenceResponse unmute(@RequestHeader("X-User-Id") UUID userId,
                                                 @RequestHeader("X-Org-Id") UUID orgId) {
        return preferenceService.unmute(userId, orgId);
    }
}
