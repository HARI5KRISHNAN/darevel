package com.darevel.wiki.content.repository;

import com.darevel.wiki.content.domain.CommentMention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for CommentMention entity
 */
@Repository
public interface CommentMentionRepository extends JpaRepository<CommentMention, CommentMention.CommentMentionId> {

    /**
     * Find all mentions for a specific user
     */
    @Query("SELECT cm FROM CommentMention cm WHERE cm.mentionedUserId = :userId ORDER BY cm.createdAt DESC")
    List<CommentMention> findByMentionedUserId(@Param("userId") UUID userId);

    /**
     * Find all mentions in a specific comment
     */
    @Query("SELECT cm FROM CommentMention cm WHERE cm.commentId = :commentId")
    List<CommentMention> findByCommentId(@Param("commentId") UUID commentId);

    /**
     * Delete all mentions for a comment (when comment is deleted)
     */
    void deleteByCommentId(UUID commentId);
}
