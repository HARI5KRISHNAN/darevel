package com.darevel.wiki.page.repository;

import com.darevel.wiki.page.domain.PageRevision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PageRevisionRepository extends JpaRepository<PageRevision, UUID> {

    List<PageRevision> findAllByPageIdOrderByNumberDesc(UUID pageId);

    Optional<PageRevision> findByPageIdAndNumber(UUID pageId, long number);
}
