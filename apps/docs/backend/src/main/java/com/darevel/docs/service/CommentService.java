package com.darevel.docs.service;

import com.darevel.docs.dto.CommentRequest;
import com.darevel.docs.dto.CommentResponse;
import com.darevel.docs.entity.Document;
import com.darevel.docs.entity.DocumentComment;
import com.darevel.docs.enums.CommentStatus;
import com.darevel.docs.repository.DocumentCommentRepository;
import com.darevel.docs.repository.DocumentRepository;
import com.darevel.docs.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final DocumentCommentRepository commentRepository;
    private final DocumentRepository documentRepository;
    private final PermissionService permissionService;
    private final ActivityService activityService;

    @Transactional
    public CommentResponse createComment(UUID documentId, CommentRequest request) {
        String userId = SecurityUtil.getCurrentUserId();
        String userName = SecurityUtil.getCurrentUserName();

        permissionService.checkCommentAccess(documentId, userId);

        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        DocumentComment comment = DocumentComment.builder()
                .document(document)
                .authorId(userId)
                .authorName(userName)
                .content(request.getContent())
                .range(request.getRange())
                .status(CommentStatus.OPEN)
                .build();

        if (request.getParentId() != null) {
            DocumentComment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        comment = commentRepository.save(comment);

        activityService.logActivity(documentId, userId, "COMMENT_ADDED",
                Map.of("commentId", comment.getId()));

        log.info("Comment created on document: {} by user: {}", documentId, userId);
        return mapToResponse(comment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(UUID documentId) {
        permissionService.checkAccess(documentId, SecurityUtil.getCurrentUserId());

        List<DocumentComment> comments = commentRepository
                .findByDocumentIdAndParentIsNullOrderByCreatedAtAsc(documentId);

        return comments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, CommentRequest request) {
        String userId = SecurityUtil.getCurrentUserId();

        DocumentComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthorId().equals(userId)) {
            throw new RuntimeException("Only comment author can update it");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);

        activityService.logActivity(comment.getDocument().getId(), userId, "COMMENT_UPDATED",
                Map.of("commentId", commentId));

        return mapToResponse(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        String userId = SecurityUtil.getCurrentUserId();

        DocumentComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthorId().equals(userId)) {
            permissionService.checkOwnerAccess(comment.getDocument().getId(), userId);
        }

        commentRepository.delete(comment);

        activityService.logActivity(comment.getDocument().getId(), userId, "COMMENT_DELETED",
                Map.of("commentId", commentId));

        log.info("Comment deleted: {} by user: {}", commentId, userId);
    }

    @Transactional
    public CommentResponse resolveComment(UUID commentId) {
        String userId = SecurityUtil.getCurrentUserId();

        DocumentComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        permissionService.checkEditAccess(comment.getDocument().getId(), userId);

        comment.resolve(userId);
        comment = commentRepository.save(comment);

        activityService.logActivity(comment.getDocument().getId(), userId, "COMMENT_RESOLVED",
                Map.of("commentId", commentId));

        return mapToResponse(comment);
    }

    @Transactional
    public CommentResponse reopenComment(UUID commentId) {
        String userId = SecurityUtil.getCurrentUserId();

        DocumentComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        permissionService.checkEditAccess(comment.getDocument().getId(), userId);

        comment.reopen();
        comment = commentRepository.save(comment);

        activityService.logActivity(comment.getDocument().getId(), userId, "COMMENT_REOPENED",
                Map.of("commentId", commentId));

        return mapToResponse(comment);
    }

    private CommentResponse mapToResponse(DocumentComment comment) {
        CommentResponse response = CommentResponse.builder()
                .id(comment.getId())
                .documentId(comment.getDocument().getId())
                .authorId(comment.getAuthorId())
                .authorName(comment.getAuthorName())
                .range(comment.getRange())
                .content(comment.getContent())
                .status(comment.getStatus())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .resolvedAt(comment.getResolvedAt())
                .resolvedBy(comment.getResolvedBy())
                .build();

        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            response.setReplies(comment.getReplies().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }
}
