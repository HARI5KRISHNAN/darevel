package com.darevel.wiki.space.repository;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpaceRepository extends JpaRepository<Space, UUID> {

    Optional<Space> findByKeyIgnoreCase(String key);

    boolean existsByKeyIgnoreCase(String key);

    List<Space> findAllByOwnerId(UUID ownerId);

    List<Space> findAllByVisibility(SpaceVisibility visibility);
}
