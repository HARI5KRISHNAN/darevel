package com.darevel.notification.domain.repository;

import com.darevel.notification.domain.model.NotificationEntity;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {

    Page<NotificationEntity> findByOrgIdAndUserIdOrderByCreatedAtDesc(UUID orgId, UUID userId, Pageable pageable);

    long countByUserIdAndReadFalse(UUID userId);

    List<NotificationEntity> findByIdInAndUserId(Collection<UUID> ids, UUID userId);

    @Modifying(clearAutomatically = true)
    @Query("update NotificationEntity n set n.read = true where n.userId = :userId and n.orgId = :orgId and n.read = false")
    int markAllRead(@Param("userId") UUID userId, @Param("orgId") UUID orgId);
}
