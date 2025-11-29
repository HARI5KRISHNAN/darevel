package com.darevel.billing.repository;

import com.darevel.billing.model.entity.InvoiceEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {

    @EntityGraph(attributePaths = {"subscription"})
    List<InvoiceEntity> findByOrgIdOrderByCreatedAtDesc(UUID orgId);

    @EntityGraph(attributePaths = {"subscription"})
    Optional<InvoiceEntity> findDetailedById(UUID id);
}
