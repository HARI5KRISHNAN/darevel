package com.darevel.notify.service;

import com.darevel.notify.dto.NotificationDTO;
import com.darevel.notify.entity.Notification;
import com.darevel.notify.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotifyService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(Jwt jwt, int page, int size) {
        String userId = jwt.getSubject();
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notifications.map(this::mapToDTO);
    }

    @Transactional
    public NotificationDTO markAsRead(Jwt jwt, Long notificationId) {
        String userId = jwt.getSubject();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return mapToDTO(notification);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Jwt jwt) {
        String userId = jwt.getSubject();
        return notificationRepository.countUnreadByUserId(userId);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .actionUrl(notification.getActionUrl())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
