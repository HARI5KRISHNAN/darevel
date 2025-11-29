package com.darevel.notification.service;

import com.darevel.notification.domain.dto.NotificationListResponse;
import com.darevel.notification.domain.dto.NotificationResponse;
import com.darevel.notification.domain.model.NotificationEntity;
import com.darevel.notification.domain.repository.NotificationRepository;
import com.darevel.notification.messaging.NotificationEvent;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public static final String UNREAD_CACHE = "unread";

    private final NotificationRepository repository;
    private final NotificationMapper mapper;
    private final NotificationWebsocketPublisher websocketPublisher;

    public NotificationService(NotificationRepository repository,
                               NotificationMapper mapper,
                               NotificationWebsocketPublisher websocketPublisher) {
        this.repository = repository;
        this.mapper = mapper;
        this.websocketPublisher = websocketPublisher;
    }

    @Transactional
    public void ingest(NotificationEvent event) {
        NotificationEntity entity = NotificationEntity.builder()
                .orgId(event.orgId())
                .userId(event.userId())
                .source(event.source())
                .type(event.type())
                .title(event.title())
                .body(event.body())
                .metadata(event.metadata())
                .priority(event.highPriority() ? "high" : "normal")
                .read(false)
                .createdAt(event.createdAt() != null ? event.createdAt() : OffsetDateTime.now())
                .build();
        NotificationEntity saved = repository.save(entity);
        websocketPublisher.publish(saved.getUserId(), mapper.toResponse(saved));
        evictUnread(saved.getUserId());
    }

    public NotificationListResponse list(UUID userId, UUID orgId, int limit, int offset) {
        Pageable pageable = PageRequest.of(offset / limit, limit);
        Page<NotificationEntity> page = repository.findByOrgIdAndUserIdOrderByCreatedAtDesc(orgId, userId, pageable);
        List<NotificationResponse> responses = page.getContent().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return new NotificationListResponse(responses, page.getTotalElements(), limit, offset);
    }

    @Cacheable(cacheNames = UNREAD_CACHE, key = "#userId")
    public long unreadCount(UUID userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(UUID userId, List<UUID> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return;
        }
        List<NotificationEntity> entities = repository.findByIdInAndUserId(notificationIds, userId);
        entities.forEach(entity -> entity.setRead(true));
        repository.saveAll(entities);
        evictUnread(userId);
    }

    @Transactional
    public void markAllRead(UUID userId, UUID orgId) {
        repository.markAllRead(userId, orgId);
        evictUnread(userId);
    }

    @CacheEvict(cacheNames = UNREAD_CACHE, key = "#userId")
    public void evictUnread(UUID userId) {
        // Annotation handles eviction
    }
}
