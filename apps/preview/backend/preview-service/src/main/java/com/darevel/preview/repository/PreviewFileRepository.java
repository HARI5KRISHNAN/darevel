package com.darevel.preview.repository;

import com.darevel.preview.domain.PreviewStatus;
import com.darevel.preview.entity.PreviewFileEntity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PreviewFileRepository extends JpaRepository<PreviewFileEntity, UUID> {

    Page<PreviewFileEntity> findByOrgIdAndStatusIn(String orgId, List<PreviewStatus> statuses, Pageable pageable);

    List<PreviewFileEntity> findTop50ByStatusOrderByCreatedAtAsc(PreviewStatus status);

    @Query("select f from PreviewFileEntity f where f.status = :status and (f.expiresAt is null or f.expiresAt < :threshold) order by f.updatedAt asc")
    List<PreviewFileEntity> findExpired(@Param("status") PreviewStatus status, @Param("threshold") Instant threshold);

    Optional<PreviewFileEntity> findByIdAndOrgId(UUID id, String orgId);
}
