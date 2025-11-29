package com.darevel.wiki.content.service;

import com.darevel.wiki.content.domain.BlockComment;
import com.darevel.wiki.content.domain.CommentMention;
import com.darevel.wiki.content.dto.AddCommentRequest;
import com.darevel.wiki.content.dto.BlockCommentResponse;
import com.darevel.wiki.content.event.ContentEvent;
import com.darevel.wiki.content.event.ContentEventPublisher;
import com.darevel.wiki.content.repository.BlockCommentRepository;
import com.darevel.wiki.content.repository.CommentMentionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing inline block comments
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final BlockCommentRepository commentRepository;
    private final CommentMentionRepository mentionRepository;
    private final ContentEventPublisher eventPublisher;

    /**
     * Add a comment on a block
     */
    @Transactional
    public BlockCommentResponse addComment(AddCommentRequest request) {
        Instant now = Instant.now();

        BlockComment comment = BlockComment.builder()
            .pageId(request.pageId())
            .blockId(request.blockId())
            .parentId(request.parentId())
            .content(request.content())
            .createdBy(request.createdBy())
            .createdAt(now)
            .build();

        BlockComment saved = commentRepository.save(comment);

        // Save mentions
        if (request.mentions() != null && !request.mentions().isEmpty()) {
            saveMentions(saved.getId(), request.mentions());
        }

        // Publish event
        eventPublisher.publish(ContentEvent.commentAdded(request.pageId(), request.createdBy()));

        log.info("Added comment: {} on block: {} in page: {}", saved.getId(), request.blockId(), request.pageId());

        return toCommentResponse(saved, new ArrayList<>(), request.mentions());
    }

    /**
     * Get all comments for a page
     */
    @Transactional(readOnly = true)
    public List<BlockCommentResponse> getPageComments(UUID pageId) {
        List<BlockComment> comments = commentRepository.findByPageIdOrderByCreatedAtAsc(pageId);

        // Build comment tree (top-level comments with nested replies)
        Map<UUID, List<BlockComment>> repliesMap = comments.stream()
            .filter(c -> c.getParentId() != null)
            .collect(Collectors.groupingBy(BlockComment::getParentId));

        List<BlockComment> topLevelComments = comments.stream()
            .filter(c -> c.getParentId() == null)
            .toList();

        return topLevelComments.stream()
            .map(comment -> toCommentResponseWithReplies(comment, repliesMap))
            .toList();
    }

    /**
     * Get comments for a specific block
     */
    @Transactional(readOnly = true)
    public List<BlockCommentResponse> getBlockComments(UUID pageId, String blockId) {
        List<BlockComment> comments = commentRepository.findByPageIdAndBlockIdOrderByCreatedAtAsc(pageId, blockId);

        // Build comment tree
        Map<UUID, List<BlockComment>> repliesMap = comments.stream()
            .filter(c -> c.getParentId() != null)
            .collect(Collectors.groupingBy(BlockComment::getParentId));

        List<BlockComment> topLevelComments = comments.stream()
            .filter(c -> c.getParentId() == null)
            .toList();

        return topLevelComments.stream()
            .map(comment -> toCommentResponseWithReplies(comment, repliesMap))
            .toList();
    }

    /**
     * Get unresolved comments for a page
     */
    @Transactional(readOnly = true)
    public List<BlockCommentResponse> getUnresolvedComments(UUID pageId) {
        List<BlockComment> comments = commentRepository.findUnresolvedByPageId(pageId);

        return comments.stream()
            .map(comment -> {
                List<UUID> mentions = getMentionsForComment(comment.getId());
                return toCommentResponse(comment, new ArrayList<>(), mentions);
            })
            .toList();
    }

    /**
     * Update a comment
     */
    @Transactional
    public BlockCommentResponse updateComment(UUID commentId, String newContent, UUID userId) {
        BlockComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        // Verify ownership
        if (!comment.getCreatedBy().equals(userId)) {
            throw new IllegalStateException("Only the comment author can update it");
        }

        comment.setContent(newContent);
        comment.setUpdatedAt(Instant.now());

        BlockComment saved = commentRepository.save(comment);

        List<UUID> mentions = getMentionsForComment(commentId);

        log.info("Updated comment: {}", commentId);

        return toCommentResponse(saved, new ArrayList<>(), mentions);
    }

    /**
     * Delete a comment
     */
    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        BlockComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        // Verify ownership (or could check for admin permissions)
        if (!comment.getCreatedBy().equals(userId)) {
            throw new IllegalStateException("Only the comment author can delete it");
        }

        // Delete mentions
        mentionRepository.deleteByCommentId(commentId);

        // Delete comment
        commentRepository.delete(comment);

        log.info("Deleted comment: {}", commentId);
    }

    /**
     * Resolve a comment thread
     */
    @Transactional
    public BlockCommentResponse resolveComment(UUID commentId, UUID userId) {
        BlockComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        if (comment.isResolved()) {
            throw new IllegalStateException("Comment is already resolved");
        }

        comment.setResolvedAt(Instant.now());
        comment.setResolvedBy(userId);

        BlockComment saved = commentRepository.save(comment);

        List<UUID> mentions = getMentionsForComment(commentId);

        log.info("Resolved comment: {}", commentId);

        return toCommentResponse(saved, new ArrayList<>(), mentions);
    }

    /**
     * Unresolve a comment thread
     */
    @Transactional
    public BlockCommentResponse unresolveComment(UUID commentId) {
        BlockComment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new EntityNotFoundException("Comment not found: " + commentId));

        comment.setResolvedAt(null);
        comment.setResolvedBy(null);

        BlockComment saved = commentRepository.save(comment);

        List<UUID> mentions = getMentionsForComment(commentId);

        log.info("Unresolved comment: {}", commentId);

        return toCommentResponse(saved, new ArrayList<>(), mentions);
    }

    // Helper methods

    private void saveMentions(UUID commentId, List<UUID> userIds) {
        Instant now = Instant.now();

        List<CommentMention> mentions = userIds.stream()
            .distinct()
            .map(userId -> CommentMention.builder()
                .commentId(commentId)
                .mentionedUserId(userId)
                .createdAt(now)
                .build())
            .toList();

        mentionRepository.saveAll(mentions);
    }

    private List<UUID> getMentionsForComment(UUID commentId) {
        return mentionRepository.findByCommentId(commentId).stream()
            .map(CommentMention::getMentionedUserId)
            .toList();
    }

    private BlockCommentResponse toCommentResponse(BlockComment comment, List<BlockCommentResponse> replies,
                                                     List<UUID> mentions) {
        return new BlockCommentResponse(
            comment.getId(),
            comment.getPageId(),
            comment.getBlockId(),
            comment.getParentId(),
            comment.getContent(),
            comment.getCreatedBy(),
            comment.getCreatedAt(),
            comment.getUpdatedAt(),
            comment.getResolvedAt(),
            comment.getResolvedBy(),
            mentions,
            replies
        );
    }

    private BlockCommentResponse toCommentResponseWithReplies(BlockComment comment,
                                                                Map<UUID, List<BlockComment>> repliesMap) {
        List<UUID> mentions = getMentionsForComment(comment.getId());

        List<BlockCommentResponse> replies = repliesMap.getOrDefault(comment.getId(), new ArrayList<>())
            .stream()
            .map(reply -> toCommentResponseWithReplies(reply, repliesMap))
            .toList();

        return toCommentResponse(comment, replies, mentions);
    }
}
