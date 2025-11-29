package com.darevel.docs.repository;

import com.darevel.docs.entity.ActiveSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActiveSessionRepository extends JpaRepository<ActiveSession, UUID> {

    // Find session by session ID
    Optional<ActiveSession> findBySessionId(String sessionId);

    // Find all active sessions for a document
    List<ActiveSession> findByDocumentId(UUID documentId);

    // Find user's session for a document
    Optional<ActiveSession> findByDocumentIdAndUserId(UUID documentId, String userId);

    // Find active sessions (last seen within threshold)
    @Query("SELECT s FROM ActiveSession s " +
           "WHERE s.document.id = :documentId " +
           "AND s.lastSeenAt >= :threshold " +
           "ORDER BY s.lastSeenAt DESC")
    List<ActiveSession> findActiveSessions(@Param("documentId") UUID documentId,
                                          @Param("threshold") LocalDateTime threshold);

    // Count active collaborators
    @Query("SELECT COUNT(s) FROM ActiveSession s " +
           "WHERE s.document.id = :documentId " +
           "AND s.lastSeenAt >= :threshold")
    long countActiveCollaborators(@Param("documentId") UUID documentId,
                                  @Param("threshold") LocalDateTime threshold);

    // Delete session by session ID
    void deleteBySessionId(String sessionId);

    // Delete user's session for a document
    void deleteByDocumentIdAndUserId(UUID documentId, String userId);

    // Delete stale sessions (not seen for a while)
    @Modifying
    @Query("DELETE FROM ActiveSession s " +
           "WHERE s.lastSeenAt < :threshold")
    void deleteStale Sessions(@Param("threshold") LocalDateTime threshold);

    // Update last seen time
    @Modifying
    @Query("UPDATE ActiveSession s " +
           "SET s.lastSeenAt = :now " +
           "WHERE s.sessionId = :sessionId")
    void updateLastSeen(@Param("sessionId") String sessionId, @Param("now") LocalDateTime now);
}
