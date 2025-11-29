package com.darevel.preview.service;

import com.darevel.preview.domain.PreviewJobStatus;
import com.darevel.preview.domain.PreviewJobType;
import com.darevel.preview.domain.PreviewStatus;
import com.darevel.preview.dto.PreviewArtifactResponse;
import com.darevel.preview.dto.PreviewFileRequest;
import com.darevel.preview.dto.PreviewFileResponse;
import com.darevel.preview.dto.RegeneratePreviewResponse;
import com.darevel.preview.entity.PreviewArtifactEntity;
import com.darevel.preview.entity.PreviewFileEntity;
import com.darevel.preview.entity.PreviewJobEntity;
import com.darevel.preview.exception.PreviewNotFoundException;
import com.darevel.preview.repository.PreviewArtifactRepository;
import com.darevel.preview.repository.PreviewFileRepository;
import com.darevel.preview.repository.PreviewJobRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PreviewFileService {

    private static final Logger log = LoggerFactory.getLogger(PreviewFileService.class);

    private final PreviewFileRepository fileRepository;
    private final PreviewArtifactRepository artifactRepository;
    private final PreviewJobRepository jobRepository;

    public PreviewFileService(PreviewFileRepository fileRepository,
                              PreviewArtifactRepository artifactRepository,
                              PreviewJobRepository jobRepository) {
        this.fileRepository = fileRepository;
        this.artifactRepository = artifactRepository;
        this.jobRepository = jobRepository;
    }

    @Transactional
    public PreviewFileResponse registerFile(PreviewFileRequest request) {
        PreviewFileEntity entity = new PreviewFileEntity();
        entity.setFilename(request.getFilename());
        entity.setMimeType(request.getMimeType());
        entity.setSizeBytes(request.getSizeBytes());
        entity.setOrgId(request.getOrgId());
        entity.setOwnerId(request.getOwnerId());
        entity.setSourceUrl(request.getSourceUrl());
        entity.touchUpdatedAt();
        PreviewFileEntity saved = fileRepository.save(entity);

        PreviewJobEntity job = new PreviewJobEntity();
        job.setPreviewFile(saved);
        job.setJobType(PreviewJobType.INITIAL_GENERATION);
        jobRepository.save(job);
        log.info("Queued preview generation job {} for file {}", job.getId(), saved.getId());

        List<PreviewArtifactEntity> artifacts = Collections.emptyList();
        return PreviewMapper.toResponse(saved, artifacts);
    }

    public PreviewFileResponse getFile(UUID id, String orgId) {
        PreviewFileEntity entity = fileRepository.findByIdAndOrgId(id, orgId)
            .orElseThrow(() -> new PreviewNotFoundException("File not found"));
        List<PreviewArtifactEntity> artifacts = artifactRepository.findByPreviewFile(entity);
        return PreviewMapper.toResponse(entity, artifacts);
    }

    public Page<PreviewFileResponse> listFiles(String orgId, List<PreviewStatus> statuses, Pageable pageable) {
        List<PreviewStatus> effectiveStatuses = statuses == null || statuses.isEmpty()
            ? List.of(PreviewStatus.READY, PreviewStatus.PROCESSING, PreviewStatus.FAILED, PreviewStatus.QUEUED)
            : statuses;
        Page<PreviewFileEntity> page = fileRepository.findByOrgIdAndStatusIn(orgId, effectiveStatuses, pageable);
        List<PreviewFileResponse> mapped = page.getContent().stream()
            .map(entity -> PreviewMapper.toResponse(entity, artifactRepository.findByPreviewFile(entity)))
            .toList();
        return new PageImpl<>(mapped, pageable, page.getTotalElements());
    }

    @Transactional
    public RegeneratePreviewResponse regenerate(UUID fileId, String orgId) {
        PreviewFileEntity entity = fileRepository.findByIdAndOrgId(fileId, orgId)
            .orElseThrow(() -> new PreviewNotFoundException("File not found"));
        entity.setStatus(PreviewStatus.QUEUED);
        entity.setFailureReason(null);
        entity.touchUpdatedAt();

        PreviewJobEntity job = new PreviewJobEntity();
        job.setPreviewFile(entity);
        job.setJobType(PreviewJobType.REGENERATE);
        jobRepository.save(job);
        return new RegeneratePreviewResponse(job.getId(), Instant.now());
    }

    public List<PreviewArtifactResponse> listArtifacts(UUID id, String orgId) {
        PreviewFileEntity entity = fileRepository.findByIdAndOrgId(id, orgId)
            .orElseThrow(() -> new PreviewNotFoundException("File not found"));
        List<PreviewArtifactEntity> artifacts = artifactRepository.findByPreviewFile(entity);
        return artifacts.stream().map(PreviewMapper::toResponse).toList();
    }

    public PreviewFileEntity require(UUID id) {
        return fileRepository.findById(id)
            .orElseThrow(() -> new PreviewNotFoundException("File not found"));
    }

    public void markProcessing(PreviewFileEntity entity) {
        entity.setStatus(PreviewStatus.PROCESSING);
        entity.touchUpdatedAt();
        fileRepository.save(entity);
    }

    public void markReady(PreviewFileEntity entity) {
        entity.setStatus(PreviewStatus.READY);
        entity.setLastGeneratedAt(Instant.now());
        entity.touchUpdatedAt();
        fileRepository.save(entity);
    }

    public void markFailed(PreviewFileEntity entity, String message) {
        entity.setStatus(PreviewStatus.FAILED);
        entity.setFailureReason(message);
        entity.touchUpdatedAt();
        fileRepository.save(entity);
    }

    public void updateJob(PreviewJobEntity job, PreviewJobStatus status, String error) {
        job.setStatus(status);
        if (status == PreviewJobStatus.RUNNING) {
            job.setStartedAt(Instant.now());
        }
        if (status == PreviewJobStatus.SUCCEEDED || status == PreviewJobStatus.FAILED) {
            job.setFinishedAt(Instant.now());
        }
        job.setErrorStack(error);
        jobRepository.save(job);
    }
}
