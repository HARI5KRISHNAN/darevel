package com.darevel.docs.repository;

import com.darevel.docs.entity.DocumentPermission;
import com.darevel.docs.enums.PermissionRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentPermissionRepository extends JpaRepository<DocumentPermission, UUID> {

    // Find all permissions for a document
    List<DocumentPermission> findByDocumentId(UUID documentId);

    // Find permission for a specific user on a document
    Optional<DocumentPermission> findByDocumentIdAndUserId(UUID documentId, String userId);

    // Find permission for a specific team on a document
    Optional<DocumentPermission> findByDocumentIdAndTeamId(UUID documentId, String teamId);

    // Check if user has specific permission
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
           "FROM DocumentPermission p " +
           "WHERE p.document.id = :documentId " +
           "AND p.userId = :userId " +
           "AND p.role = :role")
    boolean hasPermission(@Param("documentId") UUID documentId,
                         @Param("userId") String userId,
                         @Param("role") PermissionRole role);

    // Check if user has any permission
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END " +
           "FROM DocumentPermission p " +
           "WHERE p.document.id = :documentId " +
           "AND p.userId = :userId")
    boolean hasAnyPermission(@Param("documentId") UUID documentId, @Param("userId") String userId);

    // Delete permission
    void deleteByDocumentIdAndUserId(UUID documentId, String userId);

    void deleteByDocumentIdAndTeamId(UUID documentId, String teamId);

    // Get user's permission role for document
    @Query("SELECT p.role FROM DocumentPermission p " +
           "WHERE p.document.id = :documentId " +
           "AND p.userId = :userId")
    Optional<PermissionRole> findRoleByDocumentIdAndUserId(@Param("documentId") UUID documentId,
                                                            @Param("userId") String userId);
}