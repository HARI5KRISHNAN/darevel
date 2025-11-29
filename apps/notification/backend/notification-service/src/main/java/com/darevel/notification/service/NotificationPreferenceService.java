package com.darevel.notification.service;

import com.darevel.notification.domain.dto.NotificationPreferenceRequest;
import com.darevel.notification.domain.dto.NotificationPreferenceResponse;
import com.darevel.notification.domain.model.NotificationPreferenceEntity;
import com.darevel.notification.domain.repository.NotificationPreferenceRepository;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository repository;

    public NotificationPreferenceService(NotificationPreferenceRepository repository) {
        this.repository = repository;
    }

    public NotificationPreferenceResponse get(UUID userId, UUID orgId) {
        NotificationPreferenceEntity entity = repository.findByUserIdAndOrgId(userId, orgId)
                .orElseGet(() -> repository.save(defaultPreferences(userId, orgId)));
        return toResponse(entity);
    }

    @Transactional
    public NotificationPreferenceResponse update(UUID userId, UUID orgId, NotificationPreferenceRequest request) {
        NotificationPreferenceEntity entity = repository.findByUserIdAndOrgId(userId, orgId)
                .orElseGet(() -> defaultPreferences(userId, orgId));
        entity.setChannels(request.channels());
        entity.setDesktopPushEnabled(request.desktopPushEnabled());
        entity.setMobilePushEnabled(request.mobilePushEnabled());
        entity.setSoundEnabled(request.soundEnabled());
        NotificationPreferenceEntity saved = repository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public NotificationPreferenceResponse mute(UUID userId, UUID orgId, OffsetDateTime until) {
        NotificationPreferenceEntity entity = repository.findByUserIdAndOrgId(userId, orgId)
                .orElseGet(() -> defaultPreferences(userId, orgId));
        entity.setMuteUntil(until);
        return toResponse(repository.save(entity));
    }

    @Transactional
    public NotificationPreferenceResponse unmute(UUID userId, UUID orgId) {
        NotificationPreferenceEntity entity = repository.findByUserIdAndOrgId(userId, orgId)
                .orElseGet(() -> defaultPreferences(userId, orgId));
        entity.setMuteUntil(null);
        return toResponse(repository.save(entity));
    }

    private NotificationPreferenceResponse toResponse(NotificationPreferenceEntity entity) {
        return new NotificationPreferenceResponse(
                entity.getUserId(),
                entity.getOrgId(),
                entity.getChannels(),
                entity.getMuteUntil(),
                entity.isDesktopPushEnabled(),
                entity.isMobilePushEnabled(),
                entity.isSoundEnabled()
        );
    }

    private NotificationPreferenceEntity defaultPreferences(UUID userId, UUID orgId) {
        Map<String, Boolean> channels = new HashMap<>();
        channels.put("chat", true);
        channels.put("mail", true);
        channels.put("calendar", true);
        channels.put("docs", true);
        channels.put("wiki", true);
        channels.put("kanban", true);
        channels.put("forms", true);
        return NotificationPreferenceEntity.builder()
                .userId(userId)
                .orgId(orgId)
                .channels(channels)
                .desktopPushEnabled(true)
                .mobilePushEnabled(false)
                .soundEnabled(true)
                .build();
    }
}
