package com.darevel.wiki.page.service;

import com.darevel.wiki.page.domain.Page;
import com.darevel.wiki.page.domain.PageRevision;
import com.darevel.wiki.page.dto.CreatePageRequest;
import com.darevel.wiki.page.dto.PageResponse;
import com.darevel.wiki.page.dto.PageRevisionResponse;
import com.darevel.wiki.page.dto.PageSummaryResponse;
import com.darevel.wiki.page.dto.UpdatePageRequest;
import com.darevel.wiki.page.event.PageEvent;
import com.darevel.wiki.page.event.PageEventType;
import com.darevel.wiki.page.exception.InvalidPageHierarchyException;
import com.darevel.wiki.page.exception.PageNotFoundException;
import com.darevel.wiki.page.exception.PageRevisionNotFoundException;
import com.darevel.wiki.page.exception.PageSlugAlreadyExistsException;
import com.darevel.wiki.page.mapper.PageMapper;
import com.darevel.wiki.page.repository.PageRepository;
import com.darevel.wiki.page.repository.PageRevisionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;
    private final PageRevisionRepository revisionRepository;
    private final PageMapper pageMapper;
    private final PageEventPublisher eventPublisher;

    @Transactional
    public PageResponse createPage(CreatePageRequest request) {
        String normalizedSlug = request.slug().trim().toLowerCase(Locale.ROOT);
        if (pageRepository.existsBySpaceIdAndSlug(request.spaceId(), normalizedSlug)) {
            throw new PageSlugAlreadyExistsException(normalizedSlug);
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        String path = resolvePath(request.parentId(), request.spaceId(), normalizedSlug);

        Page page = Page.builder()
            .spaceId(request.spaceId())
            .parentId(request.parentId())
            .title(request.title())
            .slug(normalizedSlug)
            .path(path)
            .status(request.status())
            .currentRevision(1)
            .createdBy(request.authorId())
            .updatedBy(request.authorId())
            .createdAt(now)
            .updatedAt(now)
            .build();
        Page saved = pageRepository.save(page);

        PageRevision revision = PageRevision.builder()
            .pageId(saved.getId())
            .number(1)
            .authorId(request.authorId())
            .summary(request.summary())
            .content(request.content())
            .createdAt(now)
            .build();
        revisionRepository.save(revision);

        publishEvent(saved, PageEventType.PAGE_CREATED, Map.of(
            "authorId", request.authorId().toString(),
            "status", saved.getStatus().name()
        ));

        return pageMapper.toResponse(saved, List.of(revision));
    }

    @Transactional(readOnly = true)
    public PageResponse getPage(UUID pageId) {
        Page page = getPageOrThrow(pageId);
        List<PageRevision> revisions = revisionRepository.findAllByPageIdOrderByNumberDesc(pageId);
        return pageMapper.toResponse(page, revisions);
    }

    @Transactional(readOnly = true)
    public List<PageSummaryResponse> listPages(UUID spaceId) {
        return pageRepository.findAllBySpaceId(spaceId)
            .stream()
            .sorted(Comparator.comparing(Page::getPath))
            .map(pageMapper::toSummary)
            .toList();
    }

    @Transactional
    public PageResponse updatePage(UUID pageId, UpdatePageRequest request) {
        Page page = getPageOrThrow(pageId);
        boolean parentChanged = (request.parentId() == null && page.getParentId() != null)
            || (request.parentId() != null && !request.parentId().equals(page.getParentId()));

        page.setTitle(request.title());
        if (request.status() != null) {
            page.setStatus(request.status());
        }
        if (parentChanged) {
            page.setParentId(request.parentId());
            page.setPath(resolvePath(request.parentId(), page.getSpaceId(), page.getSlug()));
        }
        page.setUpdatedBy(request.editorId());
        page.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

        PageRevision revision = null;
        if (request.content() != null) {
            page.setCurrentRevision(page.getCurrentRevision() + 1);
            revision = PageRevision.builder()
                .pageId(pageId)
                .number(page.getCurrentRevision())
                .authorId(request.editorId())
                .summary(request.summary())
                .content(request.content())
                .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();
            revisionRepository.save(revision);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("editorId", request.editorId().toString());
        if (request.status() != null) {
            payload.put("status", page.getStatus().name());
        }
        if (parentChanged) {
            payload.put("parentId", request.parentId() == null ? null : request.parentId().toString());
        }
        publishEvent(page, PageEventType.PAGE_UPDATED, payload);

        List<PageRevision> revisions = revisionRepository.findAllByPageIdOrderByNumberDesc(pageId);
        return pageMapper.toResponse(page, revisions);
    }

    @Transactional
    public void deletePage(UUID pageId) {
        Page page = getPageOrThrow(pageId);
        revisionRepository.deleteAll(revisionRepository.findAllByPageIdOrderByNumberDesc(pageId));
        pageRepository.delete(page);
        publishEvent(page, PageEventType.PAGE_DELETED, Map.of());
    }

    @Transactional(readOnly = true)
    public PageRevisionResponse getRevision(UUID pageId, long revisionNumber) {
        Page page = getPageOrThrow(pageId);
        PageRevision revision = revisionRepository.findByPageIdAndNumber(page.getId(), revisionNumber)
            .orElseThrow(PageRevisionNotFoundException::new);
        return pageMapper.toRevisionResponse(revision);
    }

    private Page getPageOrThrow(UUID pageId) {
        return pageRepository.findById(pageId)
            .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId));
    }

    private String resolvePath(UUID parentId, UUID spaceId, String slug) {
        if (parentId == null) {
            return "/" + slug;
        }
        Page parent = pageRepository.findById(parentId)
            .orElseThrow(() -> new PageNotFoundException("Parent page not found: " + parentId));
        if (!parent.getSpaceId().equals(spaceId)) {
            throw new InvalidPageHierarchyException("Parent page must belong to the same space");
        }
        return parent.getPath() + "/" + slug;
    }

    private void publishEvent(Page page, PageEventType type, Map<String, Object> payload) {
        PageEvent event = new PageEvent(
            type,
            page.getId(),
            page.getSpaceId(),
            page.getPath(),
            OffsetDateTime.now(ZoneOffset.UTC),
            new HashMap<>(payload)
        );
        eventPublisher.publish(event);
    }
}
