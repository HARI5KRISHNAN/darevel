package com.darevel.drive.meta.repository;

import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.domain.SpaceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriveSpaceRepository extends JpaRepository<DriveSpace, UUID> {

    List<DriveSpace> findAllByOwnerId(UUID ownerId);

    List<DriveSpace> findAllByType(SpaceType type);
}
