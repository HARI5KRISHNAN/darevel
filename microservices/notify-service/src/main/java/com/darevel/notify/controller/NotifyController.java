package com.darevel.notify.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.notify.dto.NotificationDTO;
import com.darevel.notify.service.NotifyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notify")
@RequiredArgsConstructor
public class NotifyController {

    private final NotifyService notifyService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<NotificationDTO> notifications = notifyService.getNotifications(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        NotificationDTO notification = notifyService.markAsRead(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", notification));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long count = notifyService.getUnreadCount(jwt);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
