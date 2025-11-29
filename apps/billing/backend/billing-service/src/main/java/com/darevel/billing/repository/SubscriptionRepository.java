package com.darevel.billing.repository;

import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.model.enums.SubscriptionStatus;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, UUID> {

    @EntityGraph(attributePaths = "plan")
    Optional<SubscriptionEntity> findByOrgId(UUID orgId);

    @EntityGraph(attributePaths = "plan")
    Optional<SubscriptionEntity> findByExternalSubscriptionId(String externalSubscriptionId);

    List<SubscriptionEntity> findByStatusInAndTrialEndBefore(List<SubscriptionStatus> statuses, OffsetDateTime cutoff);
}
