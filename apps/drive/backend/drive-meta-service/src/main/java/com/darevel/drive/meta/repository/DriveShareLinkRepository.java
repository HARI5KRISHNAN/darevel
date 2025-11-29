package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DriveShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriveShareLinkRepository extends JpaRepository<DriveShareLink, UUID> {

    List<DriveShareLink> findAllByNodeId(UUID nodeId);

    Optional<DriveShareLink> findByShareToken(String shareToken);

    void deleteByNodeId(UUID nodeId);
}
