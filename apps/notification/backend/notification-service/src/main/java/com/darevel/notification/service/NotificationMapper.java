package com.darevel.notification.service;

import com.darevel.notification.domain.dto.NotificationResponse;
import com.darevel.notification.domain.model.NotificationEntity;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(NotificationEntity entity) {
        return new NotificationResponse(
                entity.getId(),
                entity.getOrgId(),
                entity.getUserId(),
                entity.getSource(),
                entity.getType(),
                entity.getTitle(),
                entity.getBody(),
                entity.getMetadata(),
                entity.isRead(),
                entity.getPriority(),
                entity.getCreatedAt()
        );
    }
}
