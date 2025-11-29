package com.darevel.docs.repository;

import com.darevel.docs.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    // Find document by ID and not deleted
    Optional<Document> findByIdAndIsDeletedFalse(UUID id);

    // Find all documents for an organization
    List<Document> findByOrgIdAndIsDeletedFalse(String orgId);

    // Find all documents owned by a user
    List<Document> findByOwnerIdAndIsDeletedFalse(String ownerId);

    // Find documents where user is owner or has permission
    @Query("SELECT DISTINCT d FROM Document d " +
           "LEFT JOIN d.permissions p " +
           "WHERE d.isDeleted = false " +
           "AND (d.ownerId = :userId OR p.userId = :userId) " +
           "AND d.orgId = :orgId " +
           "ORDER BY d.updatedAt DESC")
    List<Document> findAccessibleDocuments(@Param("userId") String userId, @Param("orgId") String orgId);

    // Find templates
    List<Document> findByIsTemplateTrueAndIsDeletedFalse();

    // Search documents by title
    @Query("SELECT d FROM Document d " +
           "WHERE d.isDeleted = false " +
           "AND d.orgId = :orgId " +
           "AND LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Document> searchByTitle(@Param("query") String query, @Param("orgId") String orgId);

    // Count documents by owner
    long countByOwnerIdAndIsDeletedFalse(String ownerId);

    // Find recently updated documents
    @Query("SELECT d FROM Document d " +
           "WHERE d.isDeleted = false " +
           "AND d.orgId = :orgId " +
           "ORDER BY d.updatedAt DESC")
    List<Document> findRecentlyUpdated(@Param("orgId") String orgId);
}
