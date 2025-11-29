package com.darevel.wiki.content.service;

import com.darevel.wiki.content.domain.Block;
import com.darevel.wiki.content.domain.ContentHistory;
import com.darevel.wiki.content.domain.PageContent;
import com.darevel.wiki.content.dto.*;
import com.darevel.wiki.content.event.ContentEvent;
import com.darevel.wiki.content.event.ContentEventPublisher;
import com.darevel.wiki.content.repository.ContentHistoryRepository;
import com.darevel.wiki.content.repository.PageContentRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing page content
 * Handles block-based content storage with optimistic locking
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContentService {

    private static final int HISTORY_RETENTION_LIMIT = 50; // Keep last 50 versions

    private final PageContentRepository contentRepository;
    private final ContentHistoryRepository historyRepository;
    private final ContentEventPublisher eventPublisher;

    /**
     * Get content for a page
     */
    @Transactional(readOnly = true)
    public ContentResponse getContent(UUID pageId) {
        PageContent content = contentRepository.findById(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        return toContentResponse(content);
    }

    /**
     * Create initial content for a new page
     */
    @Transactional
    public ContentResponse createContent(CreateContentRequest request) {
        if (contentRepository.existsByPageId(request.pageId())) {
            throw new IllegalStateException("Content already exists for page: " + request.pageId());
        }

        Instant now = Instant.now();

        PageContent content = PageContent.builder()
            .pageId(request.pageId())
            .blocks(request.blocks() != null ? request.blocks() : new ArrayList<>())
            .version(1L)
            .createdBy(request.createdBy())
            .createdAt(now)
            .updatedBy(request.createdBy())
            .updatedAt(now)
            .build();

        PageContent saved = contentRepository.save(content);

        // Save to history
        saveHistory(saved, ContentHistory.ChangeType.UPDATE, "Initial content created");

        // Publish event
        eventPublisher.publish(ContentEvent.contentCreated(saved.getPageId(), saved.getCreatedBy()));

        log.info("Created content for page: {}", request.pageId());

        return toContentResponse(saved);
    }

    /**
     * Update content for a page (full replacement)
     * Uses optimistic locking to prevent conflicts
     */
    @Transactional
    public ContentResponse updateContent(UUID pageId, UpdateContentRequest request) {
        PageContent content = contentRepository.findByPageIdWithVersion(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        // Check version for optimistic locking
        if (!content.getVersion().equals(request.expectedVersion())) {
            throw new OptimisticLockException(
                String.format("Content was modified by another user. Expected version: %d, actual: %d",
                    request.expectedVersion(), content.getVersion())
            );
        }

        // Update blocks
        content.setBlocks(request.blocks());
        content.setUpdatedBy(request.updatedBy());
        content.setUpdatedAt(Instant.now());

        PageContent saved = contentRepository.save(content);

        // Save to history
        String summary = request.changeSummary() != null ? request.changeSummary() : "Content updated";
        saveHistory(saved, ContentHistory.ChangeType.UPDATE, summary);

        // Publish event
        eventPublisher.publish(ContentEvent.contentUpdated(
            saved.getPageId(),
            saved.getUpdatedBy(),
            saved.getVersion(),
            summary
        ));

        // Cleanup old history
        historyRepository.deleteOldHistory(pageId, HISTORY_RETENTION_LIMIT);

        log.info("Updated content for page: {}, new version: {}", pageId, saved.getVersion());

        return toContentResponse(saved);
    }

    /**
     * Update a single block
     */
    @Transactional
    public ContentResponse updateBlock(UUID pageId, String blockId, UpdateBlockRequest request) {
        PageContent content = contentRepository.findByPageIdWithVersion(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        // Check version
        if (!content.getVersion().equals(request.expectedVersion())) {
            throw new OptimisticLockException("Content was modified by another user");
        }

        // Find and update the block
        List<Block> blocks = content.getBlocks();
        boolean found = updateBlockRecursive(blocks, blockId, request.block());

        if (!found) {
            throw new EntityNotFoundException("Block not found: " + blockId);
        }

        content.setUpdatedBy(request.updatedBy());
        content.setUpdatedAt(Instant.now());

        PageContent saved = contentRepository.save(content);

        // Save to history
        saveHistory(saved, ContentHistory.ChangeType.UPDATE, "Block updated: " + blockId);

        // Publish event
        eventPublisher.publish(ContentEvent.contentUpdated(
            saved.getPageId(),
            saved.getUpdatedBy(),
            saved.getVersion(),
            "Block updated"
        ));

        log.info("Updated block: {} in page: {}", blockId, pageId);

        return toContentResponse(saved);
    }

    /**
     * Add a new block to the page
     */
    @Transactional
    public ContentResponse addBlock(UUID pageId, Block block, UUID userId, Long expectedVersion) {
        PageContent content = contentRepository.findByPageIdWithVersion(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        // Check version
        if (!content.getVersion().equals(expectedVersion)) {
            throw new OptimisticLockException("Content was modified by another user");
        }

        // Add block
        content.getBlocks().add(block);
        content.setUpdatedBy(userId);
        content.setUpdatedAt(Instant.now());

        PageContent saved = contentRepository.save(content);

        // Save to history
        saveHistory(saved, ContentHistory.ChangeType.BLOCK_ADD, "Block added: " + block.getId());

        // Publish event
        eventPublisher.publish(ContentEvent.blockAdded(saved.getPageId(), userId, saved.getVersion()));

        log.info("Added block: {} to page: {}", block.getId(), pageId);

        return toContentResponse(saved);
    }

    /**
     * Delete a block from the page
     */
    @Transactional
    public ContentResponse deleteBlock(UUID pageId, String blockId, UUID userId, Long expectedVersion) {
        PageContent content = contentRepository.findByPageIdWithVersion(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        // Check version
        if (!content.getVersion().equals(expectedVersion)) {
            throw new OptimisticLockException("Content was modified by another user");
        }

        // Remove block
        boolean removed = removeBlockRecursive(content.getBlocks(), blockId);

        if (!removed) {
            throw new EntityNotFoundException("Block not found: " + blockId);
        }

        content.setUpdatedBy(userId);
        content.setUpdatedAt(Instant.now());

        PageContent saved = contentRepository.save(content);

        // Save to history
        saveHistory(saved, ContentHistory.ChangeType.BLOCK_DELETE, "Block deleted: " + blockId);

        // Publish event
        eventPublisher.publish(ContentEvent.blockDeleted(saved.getPageId(), userId, saved.getVersion()));

        log.info("Deleted block: {} from page: {}", blockId, pageId);

        return toContentResponse(saved);
    }

    /**
     * Get content history for a page
     */
    @Transactional(readOnly = true)
    public List<ContentHistoryResponse> getHistory(UUID pageId, int limit) {
        List<ContentHistory> history = historyRepository.findRecentHistory(
            pageId,
            PageRequest.of(0, limit)
        );

        return history.stream()
            .map(this::toHistoryResponse)
            .toList();
    }

    /**
     * Get a specific version from history
     */
    @Transactional(readOnly = true)
    public ContentHistoryResponse getVersion(UUID pageId, Long version) {
        ContentHistory history = historyRepository.findByPageIdAndVersion(pageId, version)
            .orElseThrow(() -> new EntityNotFoundException(
                "Version " + version + " not found for page: " + pageId));

        return toHistoryResponse(history);
    }

    /**
     * Restore content from a historical version
     */
    @Transactional
    public ContentResponse restoreVersion(UUID pageId, Long versionToRestore, UUID userId, Long expectedVersion) {
        // Get the historical version
        ContentHistory history = historyRepository.findByPageIdAndVersion(pageId, versionToRestore)
            .orElseThrow(() -> new EntityNotFoundException(
                "Version " + versionToRestore + " not found for page: " + pageId));

        // Get current content
        PageContent content = contentRepository.findByPageIdWithVersion(pageId)
            .orElseThrow(() -> new EntityNotFoundException("Content not found for page: " + pageId));

        // Check version
        if (!content.getVersion().equals(expectedVersion)) {
            throw new OptimisticLockException("Content was modified by another user");
        }

        // Restore blocks from history
        content.setBlocks(new ArrayList<>(history.getBlocks()));
        content.setUpdatedBy(userId);
        content.setUpdatedAt(Instant.now());

        PageContent saved = contentRepository.save(content);

        // Save to history
        saveHistory(saved, ContentHistory.ChangeType.RESTORE,
            "Restored from version " + versionToRestore);

        // Publish event
        eventPublisher.publish(ContentEvent.contentUpdated(
            saved.getPageId(),
            userId,
            saved.getVersion(),
            "Restored from version " + versionToRestore
        ));

        log.info("Restored page: {} to version: {}", pageId, versionToRestore);

        return toContentResponse(saved);
    }

    // Helper methods

    private void saveHistory(PageContent content, ContentHistory.ChangeType changeType, String summary) {
        ContentHistory history = ContentHistory.builder()
            .pageId(content.getPageId())
            .blocks(new ArrayList<>(content.getBlocks()))
            .version(content.getVersion())
            .changedBy(content.getUpdatedBy())
            .changedAt(content.getUpdatedAt())
            .changeType(changeType)
            .changeSummary(summary)
            .build();

        historyRepository.save(history);
    }

    private boolean updateBlockRecursive(List<Block> blocks, String blockId, Block updatedBlock) {
        for (int i = 0; i < blocks.size(); i++) {
            Block block = blocks.get(i);
            if (block.getId().equals(blockId)) {
                blocks.set(i, updatedBlock);
                return true;
            }
            if (block.getChildren() != null && !block.getChildren().isEmpty()) {
                if (updateBlockRecursive(block.getChildren(), blockId, updatedBlock)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean removeBlockRecursive(List<Block> blocks, String blockId) {
        for (int i = 0; i < blocks.size(); i++) {
            Block block = blocks.get(i);
            if (block.getId().equals(blockId)) {
                blocks.remove(i);
                return true;
            }
            if (block.getChildren() != null && !block.getChildren().isEmpty()) {
                if (removeBlockRecursive(block.getChildren(), blockId)) {
                    return true;
                }
            }
        }
        return false;
    }

    private ContentResponse toContentResponse(PageContent content) {
        return new ContentResponse(
            content.getPageId(),
            content.getBlocks(),
            content.getVersion(),
            content.getUpdatedAt(),
            content.getUpdatedBy(),
            content.getCreatedAt(),
            content.getCreatedBy()
        );
    }

    private ContentHistoryResponse toHistoryResponse(ContentHistory history) {
        return new ContentHistoryResponse(
            history.getId(),
            history.getPageId(),
            history.getBlocks(),
            history.getVersion(),
            history.getChangedBy(),
            history.getChangedAt(),
            history.getChangeType(),
            history.getChangeSummary()
        );
    }
}
