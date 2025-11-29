package com.darevel.wiki.content.repository;

import com.darevel.wiki.content.domain.ContentHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ContentHistory entity
 */
@Repository
public interface ContentHistoryRepository extends JpaRepository<ContentHistory, UUID> {

    /**
     * Find all history entries for a page, ordered by version descending
     */
    @Query("SELECT ch FROM ContentHistory ch WHERE ch.pageId = :pageId ORDER BY ch.version DESC")
    Page<ContentHistory> findByPageIdOrderByVersionDesc(@Param("pageId") UUID pageId, Pageable pageable);

    /**
     * Find specific version of content
     */
    Optional<ContentHistory> findByPageIdAndVersion(UUID pageId, Long version);

    /**
     * Get recent history (last N entries)
     */
    @Query("SELECT ch FROM ContentHistory ch WHERE ch.pageId = :pageId ORDER BY ch.changedAt DESC")
    List<ContentHistory> findRecentHistory(@Param("pageId") UUID pageId, Pageable pageable);

    /**
     * Delete old history entries beyond retention limit
     * Keep only the latest N entries per page
     */
    @Modifying
    @Query(value = """
        DELETE FROM content_history
        WHERE id IN (
            SELECT id FROM (
                SELECT id, ROW_NUMBER() OVER (PARTITION BY page_id ORDER BY changed_at DESC) as rn
                FROM content_history
                WHERE page_id = :pageId
            ) t
            WHERE t.rn > :retentionLimit
        )
        """, nativeQuery = true)
    int deleteOldHistory(@Param("pageId") UUID pageId, @Param("retentionLimit") int retentionLimit);
}
