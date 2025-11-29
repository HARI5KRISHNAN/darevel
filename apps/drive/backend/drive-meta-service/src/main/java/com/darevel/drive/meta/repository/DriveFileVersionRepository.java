package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DriveFileVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriveFileVersionRepository extends JpaRepository<DriveFileVersion, UUID> {

    List<DriveFileVersion> findAllByNodeIdOrderByVersionNumberDesc(UUID nodeId);

    Optional<DriveFileVersion> findFirstByNodeIdOrderByVersionNumberDesc(UUID nodeId);

    Optional<DriveFileVersion> findByNodeIdAndVersionNumber(UUID nodeId, long versionNumber);
}
