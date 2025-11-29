package com.darevel.docs.repository;

import com.darevel.docs.entity.DocumentActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentActivityRepository extends JpaRepository<DocumentActivity, UUID> {

    // Find all activities for a document
    List<DocumentActivity> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);

    // Find activities with pagination
    Page<DocumentActivity> findByDocumentIdOrderByCreatedAtDesc(UUID documentId, Pageable pageable);

    // Find recent activities (last 24 hours)
    @Query("SELECT a FROM DocumentActivity a " +
           "WHERE a.document.id = :documentId " +
           "AND a.createdAt >= :since " +
           "ORDER BY a.createdAt DESC")
    List<DocumentActivity> findRecentActivities(@Param("documentId") UUID documentId,
                                                @Param("since") LocalDateTime since);

    // Find activities by user
    List<DocumentActivity> findByDocumentIdAndUserIdOrderByCreatedAtDesc(UUID documentId, String userId);

    // Find activities by action type
    List<DocumentActivity> findByDocumentIdAndActionOrderByCreatedAtDesc(UUID documentId, String action);

    // Count activities for a document
    long countByDocumentId(UUID documentId);
}
