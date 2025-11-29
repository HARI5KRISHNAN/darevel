package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DrivePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DrivePermissionRepository extends JpaRepository<DrivePermission, UUID> {

    List<DrivePermission> findAllByNodeId(UUID nodeId);

    List<DrivePermission> findAllByUserId(UUID userId);

    Optional<DrivePermission> findByNodeIdAndUserId(UUID nodeId, UUID userId);

    void deleteByNodeIdAndUserId(UUID nodeId, UUID userId);
}
