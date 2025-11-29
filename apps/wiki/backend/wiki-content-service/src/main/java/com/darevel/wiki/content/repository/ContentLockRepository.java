package com.darevel.wiki.content.repository;

import com.darevel.wiki.content.domain.ContentLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ContentLock entity
 */
@Repository
public interface ContentLockRepository extends JpaRepository<ContentLock, UUID> {

    /**
     * Find active lock for a page
     */
    Optional<ContentLock> findByPageId(UUID pageId);

    /**
     * Delete expired locks (cleanup task)
     */
    @Modifying
    @Query("DELETE FROM ContentLock cl WHERE cl.expiresAt < :now")
    int deleteExpiredLocks(@Param("now") Instant now);

    /**
     * Check if page is locked
     */
    boolean existsByPageId(UUID pageId);
}
