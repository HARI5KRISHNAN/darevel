package com.darevel.wiki.content.repository;

import com.darevel.wiki.content.domain.BlockComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for BlockComment entity
 */
@Repository
public interface BlockCommentRepository extends JpaRepository<BlockComment, UUID> {

    /**
     * Find all comments for a page
     */
    @Query("SELECT bc FROM BlockComment bc WHERE bc.pageId = :pageId ORDER BY bc.createdAt ASC")
    List<BlockComment> findByPageIdOrderByCreatedAtAsc(@Param("pageId") UUID pageId);

    /**
     * Find comments for a specific block
     */
    @Query("SELECT bc FROM BlockComment bc WHERE bc.pageId = :pageId AND bc.blockId = :blockId ORDER BY bc.createdAt ASC")
    List<BlockComment> findByPageIdAndBlockIdOrderByCreatedAtAsc(@Param("pageId") UUID pageId, @Param("blockId") String blockId);

    /**
     * Find unresolved comments for a page
     */
    @Query("SELECT bc FROM BlockComment bc WHERE bc.pageId = :pageId AND bc.resolvedAt IS NULL ORDER BY bc.createdAt ASC")
    List<BlockComment> findUnresolvedByPageId(@Param("pageId") UUID pageId);

    /**
     * Find replies to a comment
     */
    @Query("SELECT bc FROM BlockComment bc WHERE bc.parentId = :parentId ORDER BY bc.createdAt ASC")
    List<BlockComment> findReplies(@Param("parentId") UUID parentId);

    /**
     * Count unresolved comments for a page
     */
    @Query("SELECT COUNT(bc) FROM BlockComment bc WHERE bc.pageId = :pageId AND bc.resolvedAt IS NULL")
    long countUnresolvedByPageId(@Param("pageId") UUID pageId);
}
