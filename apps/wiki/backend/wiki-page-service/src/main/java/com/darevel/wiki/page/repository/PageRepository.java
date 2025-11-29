package com.darevel.wiki.page.repository;

import com.darevel.wiki.page.domain.Page;
import com.darevel.wiki.page.domain.PageStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findBySpaceIdAndSlug(UUID spaceId, String slug);

    List<Page> findAllBySpaceId(UUID spaceId);

    List<Page> findAllBySpaceIdAndParentId(UUID spaceId, UUID parentId);

    List<Page> findAllBySpaceIdAndStatus(UUID spaceId, PageStatus status);

    boolean existsBySpaceIdAndSlug(UUID spaceId, String slug);
}
