package com.darevel.docs.repository;

import com.darevel.docs.entity.DocumentComment;
import com.darevel.docs.enums.CommentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentCommentRepository extends JpaRepository<DocumentComment, UUID> {

    // Find all comments for a document
    List<DocumentComment> findByDocumentIdOrderByCreatedAtAsc(UUID documentId);

    // Find top-level comments (no parent)
    List<DocumentComment> findByDocumentIdAndParentIsNullOrderByCreatedAtAsc(UUID documentId);

    // Find replies to a comment
    List<DocumentComment> findByParentIdOrderByCreatedAtAsc(UUID parentId);

    // Find comments by status
    List<DocumentComment> findByDocumentIdAndStatusOrderByCreatedAtAsc(UUID documentId, CommentStatus status);

    // Find comments by author
    List<DocumentComment> findByDocumentIdAndAuthorIdOrderByCreatedAtDesc(UUID documentId, String authorId);

    // Count open comments
    @Query("SELECT COUNT(c) FROM DocumentComment c " +
           "WHERE c.document.id = :documentId " +
           "AND c.status = 'OPEN'")
    long countOpenComments(@Param("documentId") UUID documentId);

    // Count resolved comments
    @Query("SELECT COUNT(c) FROM DocumentComment c " +
           "WHERE c.document.id = :documentId " +
           "AND c.status = 'RESOLVED'")
    long countResolvedComments(@Param("documentId") UUID documentId);
}
