package com.darevel.preview.repository;

import com.darevel.preview.entity.PreviewArtifactEntity;
import com.darevel.preview.entity.PreviewFileEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PreviewArtifactRepository extends JpaRepository<PreviewArtifactEntity, UUID> {

    List<PreviewArtifactEntity> findByPreviewFile(PreviewFileEntity previewFile);

    Optional<PreviewArtifactEntity> findByIdAndPreviewFile(UUID id, PreviewFileEntity previewFile);
}
