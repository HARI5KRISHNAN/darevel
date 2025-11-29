package com.darevel.docs.repository;

import com.darevel.docs.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {

    // Find all versions for a document
    List<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(UUID documentId);

    // Find specific version
    Optional<DocumentVersion> findByDocumentIdAndVersionNumber(UUID documentId, Integer versionNumber);

    // Get latest version number
    @Query("SELECT MAX(v.versionNumber) FROM DocumentVersion v WHERE v.document.id = :documentId")
    Optional<Integer> getLatestVersionNumber(@Param("documentId") UUID documentId);

    // Count versions for a document
    long countByDocumentId(UUID documentId);

    // Find versions created by user
    List<DocumentVersion> findByDocumentIdAndCreatedByOrderByCreatedAtDesc(UUID documentId, String createdBy);
}
