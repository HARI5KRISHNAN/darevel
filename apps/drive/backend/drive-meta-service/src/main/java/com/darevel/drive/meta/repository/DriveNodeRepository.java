package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.NodeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriveNodeRepository extends JpaRepository<DriveNode, UUID> {

    List<DriveNode> findAllBySpaceIdAndParentIdAndDeletedAtIsNullOrderByNameAsc(UUID spaceId, UUID parentId);

    List<DriveNode> findAllBySpaceIdAndParentIdIsNullAndDeletedAtIsNullOrderByNameAsc(UUID spaceId);

    List<DriveNode> findAllBySpaceIdAndDeletedAtIsNullOrderByNameAsc(UUID spaceId);

    List<DriveNode> findAllBySpaceIdAndNodeTypeAndDeletedAtIsNull(UUID spaceId, NodeType nodeType);

    List<DriveNode> findAllBySpaceIdAndDeletedAtIsNotNullOrderByUpdatedAtDesc(UUID spaceId);

    List<DriveNode> findAllByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(UUID ownerId, Pageable pageable);

    Optional<DriveNode> findByIdAndDeletedAtIsNull(UUID nodeId);

    boolean existsBySpaceIdAndParentIdAndNameIgnoreCaseAndDeletedAtIsNull(UUID spaceId, UUID parentId, String name);

    boolean existsBySpaceIdAndParentIdIsNullAndNameIgnoreCaseAndDeletedAtIsNull(UUID spaceId, String name);

    @Query("SELECT n FROM DriveNode n WHERE n.spaceId = :spaceId AND " +
           "LOWER(n.name) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
           "n.deletedAt IS NULL ORDER BY n.name ASC")
    List<DriveNode> searchByName(@Param("spaceId") UUID spaceId, @Param("query") String query);
}
