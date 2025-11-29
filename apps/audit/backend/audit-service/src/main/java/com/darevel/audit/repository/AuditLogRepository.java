package com.darevel.audit.repository;

import com.darevel.audit.entity.AuditLogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntry, UUID> {

    Page<AuditLogEntry> findByWorkspaceIdOrderByTimestampDesc(UUID workspaceId, Pageable pageable);

    Page<AuditLogEntry> findByWorkspaceIdAndUserIdOrderByTimestampDesc(
            UUID workspaceId, UUID userId, Pageable pageable);

    @Query("SELECT a FROM AuditLogEntry a WHERE a.workspaceId = :workspaceId "
            + "AND (:userId IS NULL OR a.userId = :userId) "
            + "AND (:action IS NULL OR LOWER(a.action) = LOWER(:action)) "
            + "AND (:resourceType IS NULL OR LOWER(a.resourceType) = LOWER(:resourceType)) "
            + "AND (:resourceId IS NULL OR LOWER(a.resourceId) = LOWER(:resourceId)) "
            + "AND (:startTime IS NULL OR a.timestamp >= :startTime) "
            + "AND (:endTime IS NULL OR a.timestamp <= :endTime) "
            + "AND (:userQuery IS NULL OR ("
            + "LOWER(COALESCE(a.userName, '')) LIKE LOWER(CONCAT('%', :userQuery, '%')) "
            + "OR LOWER(COALESCE(a.userEmail, '')) LIKE LOWER(CONCAT('%', :userQuery, '%')))) "
            + "AND (:searchTerm IS NULL OR ("
            + "LOWER(COALESCE(a.description, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
            + "OR LOWER(COALESCE(a.resourceName, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
            + "OR LOWER(COALESCE(a.resourceId, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
            + "OR LOWER(COALESCE(a.userName, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%')) "
            + "OR LOWER(COALESCE(a.userEmail, '')) LIKE LOWER(CONCAT('%', :searchTerm, '%'))))")
    Page<AuditLogEntry> searchLogs(
            @Param("workspaceId") UUID workspaceId,
            @Param("userId") UUID userId,
            @Param("action") String action,
            @Param("resourceType") String resourceType,
            @Param("resourceId") String resourceId,
            @Param("userQuery") String userQuery,
            @Param("searchTerm") String searchTerm,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime,
            Pageable pageable);

    @Query("SELECT a FROM AuditLogEntry a WHERE a.timestamp < :cutoffTime")
    List<AuditLogEntry> findOlderThan(@Param("cutoffTime") OffsetDateTime cutoffTime);

    long countByWorkspaceId(UUID workspaceId);

    void deleteByTimestampBefore(OffsetDateTime cutoffTime);
}
