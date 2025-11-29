package com.darevel.wiki.content.repository;

import com.darevel.wiki.content.domain.PageContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PageContent entity
 */
@Repository
public interface PageContentRepository extends JpaRepository<PageContent, UUID> {

    /**
     * Find page content with version for optimistic locking
     */
    @Query("SELECT pc FROM PageContent pc WHERE pc.pageId = :pageId")
    Optional<PageContent> findByPageIdWithVersion(@Param("pageId") UUID pageId);

    /**
     * Check if content exists for a page
     */
    boolean existsByPageId(UUID pageId);
}
