package com.darevel.preview.repository;

import com.darevel.preview.domain.PreviewJobStatus;
import com.darevel.preview.entity.PreviewJobEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreviewJobRepository extends JpaRepository<PreviewJobEntity, UUID> {

    long countByPreviewFileIdAndStatus(UUID previewFileId, PreviewJobStatus status);
}
