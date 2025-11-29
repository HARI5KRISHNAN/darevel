package com.darevel.preview.jobs;

import com.darevel.preview.domain.PreviewArtifactType;
import com.darevel.preview.domain.PreviewStatus;
import com.darevel.preview.entity.PreviewArtifactEntity;
import com.darevel.preview.entity.PreviewFileEntity;
import com.darevel.preview.repository.PreviewArtifactRepository;
import com.darevel.preview.repository.PreviewFileRepository;
import com.darevel.preview.service.PreviewFileService;
import com.darevel.preview.service.processor.FileProcessor;
import com.darevel.preview.service.processor.ProcessorRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PreviewGenerationJob {

    private static final Logger log = LoggerFactory.getLogger(PreviewGenerationJob.class);

    private final PreviewFileRepository fileRepository;
    private final PreviewArtifactRepository artifactRepository;
    private final ProcessorRegistry processorRegistry;
    private final PreviewFileService previewFileService;
    private final ObjectMapper objectMapper;

    public PreviewGenerationJob(PreviewFileRepository fileRepository,
                                PreviewArtifactRepository artifactRepository,
                                ProcessorRegistry processorRegistry,
                                PreviewFileService previewFileService,
                                ObjectMapper objectMapper) {
        this.fileRepository = fileRepository;
        this.artifactRepository = artifactRepository;
        this.processorRegistry = processorRegistry;
        this.previewFileService = previewFileService;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelayString = "${preview.jobs.poll-interval-ms:10000}")
    public void pollQueue() {
        List<PreviewFileEntity> queued = fileRepository.findTop50ByStatusOrderByCreatedAtAsc(PreviewStatus.QUEUED);
        if (queued.isEmpty()) {
            return;
        }
        queued.forEach(this::process);
    }

    private void process(PreviewFileEntity file) {
        previewFileService.markProcessing(file);
        try {
            FileProcessor processor = processorRegistry.resolve(file.getMimeType());
            var result = processor.process(file);
            PreviewArtifactEntity artifact = new PreviewArtifactEntity();
            artifact.setPreviewFile(file);
            artifact.setArtifactType(PreviewArtifactType.TEXT_JSON);
            artifact.setStorageKey("metadata://" + file.getId());
            artifact.setMetadata(objectMapper.writeValueAsString(result.metadata()));
            artifactRepository.save(artifact);
            previewFileService.markReady(file);
            log.info("Preview ready for {}", file.getId());
        } catch (Exception ex) {
            previewFileService.markFailed(file, ex.getMessage());
            log.warn("Preview failed for {}", file.getId(), ex);
        }
    }
}
