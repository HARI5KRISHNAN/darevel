package com.darevel.wiki.space.repository;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpaceMemberRepository extends JpaRepository<SpaceMember, UUID> {

    List<SpaceMember> findAllBySpace(Space space);

    Optional<SpaceMember> findBySpaceAndUserId(Space space, UUID userId);

    void deleteBySpaceAndUserId(Space space, UUID userId);

    boolean existsBySpaceAndUserId(Space space, UUID userId);

    int countBySpace(Space space);
}
