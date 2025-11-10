package com.darevel.mail.repository;

import com.darevel.mail.entity.Email;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {

    // Inbox: emails TO the user (not drafts, not deleted)
    Page<Email> findByUserIdAndFolderAndIsDeletedFalseOrderByCreatedAtDesc(
            String userId, String folder, Pageable pageable);

    // Sent emails
    Page<Email> findByFromEmailAndIsSentTrueAndIsDeletedFalseOrderBySentAtDesc(
            String fromEmail, Pageable pageable);

    // Drafts
    Page<Email> findByUserIdAndIsDraftTrueAndIsDeletedFalseOrderByCreatedAtDesc(
            String userId, Pageable pageable);

    // Starred
    Page<Email> findByUserIdAndIsStarredTrueAndIsDeletedFalseOrderByCreatedAtDesc(
            String userId, Pageable pageable);

    // Trash
    Page<Email> findByUserIdAndIsDeletedTrueOrderByCreatedAtDesc(
            String userId, Pageable pageable);

    // Find by ID and user (for authorization)
    Optional<Email> findByIdAndUserId(Long id, String userId);

    // Unread count
    @Query("SELECT COUNT(e) FROM Email e WHERE e.userId = :userId AND e.isRead = false AND e.isDeleted = false")
    Long countUnreadByUserId(String userId);

    // Search in subject or body
    @Query("SELECT e FROM Email e WHERE e.userId = :userId AND e.isDeleted = false " +
           "AND (LOWER(e.subject) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.body) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Email> searchEmails(String userId, String query, Pageable pageable);
}
