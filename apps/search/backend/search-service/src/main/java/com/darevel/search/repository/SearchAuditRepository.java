package com.darevel.search.repository;

import com.darevel.search.entity.SearchAuditEntry;
import java.time.Instant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchAuditRepository extends JpaRepository<SearchAuditEntry, UUID> {
    long countByExecutedAtAfter(Instant executedAt);
}
