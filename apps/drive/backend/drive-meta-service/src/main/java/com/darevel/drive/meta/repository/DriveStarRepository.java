package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DriveStar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriveStarRepository extends JpaRepository<DriveStar, UUID> {

    Optional<DriveStar> findByNodeIdAndUserId(UUID nodeId, UUID userId);

    List<DriveStar> findAllByUserId(UUID userId);

    void deleteByNodeId(UUID nodeId);
}
