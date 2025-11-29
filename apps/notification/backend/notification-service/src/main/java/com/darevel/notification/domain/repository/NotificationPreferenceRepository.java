package com.darevel.notification.domain.repository;

import com.darevel.notification.domain.model.NotificationPreferenceEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreferenceEntity, UUID> {

    Optional<NotificationPreferenceEntity> findByUserIdAndOrgId(UUID userId, UUID orgId);
}
