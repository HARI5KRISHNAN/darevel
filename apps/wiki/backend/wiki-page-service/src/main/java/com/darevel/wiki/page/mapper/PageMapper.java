package com.darevel.wiki.page.mapper;

import com.darevel.wiki.page.domain.Page;
import com.darevel.wiki.page.domain.PageRevision;
import com.darevel.wiki.page.dto.PageResponse;
import com.darevel.wiki.page.dto.PageRevisionResponse;
import com.darevel.wiki.page.dto.PageSummaryResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PageMapper {

    default PageResponse toResponse(Page page, List<PageRevision> revisions) {
        return new PageResponse(
            page.getId(),
            page.getSpaceId(),
            page.getParentId(),
            page.getTitle(),
            page.getSlug(),
            page.getPath(),
            page.getStatus(),
            page.getCurrentRevision(),
            page.getCreatedBy(),
            page.getUpdatedBy(),
            page.getCreatedAt(),
            page.getUpdatedAt(),
            revisions.stream().map(this::toRevisionResponse).toList()
        );
    }

    default PageSummaryResponse toSummary(Page page) {
        return new PageSummaryResponse(
            page.getId(),
            page.getSpaceId(),
            page.getParentId(),
            page.getTitle(),
            page.getSlug(),
            page.getPath(),
            page.getStatus(),
            page.getCurrentRevision(),
            page.getUpdatedAt()
        );
    }

    default PageRevisionResponse toRevisionResponse(PageRevision revision) {
        return new PageRevisionResponse(
            revision.getId(),
            revision.getNumber(),
            revision.getAuthorId(),
            revision.getSummary(),
            revision.getContent(),
            revision.getCreatedAt()
        );
    }
}
