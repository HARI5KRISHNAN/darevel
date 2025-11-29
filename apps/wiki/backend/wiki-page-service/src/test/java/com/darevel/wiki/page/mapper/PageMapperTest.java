package com.darevel.wiki.page.mapper;

import com.darevel.wiki.page.domain.Page;
import com.darevel.wiki.page.domain.PageRevision;
import com.darevel.wiki.page.domain.PageStatus;
import com.darevel.wiki.page.dto.PageResponse;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PageMapperTest {

    private final PageMapper mapper = Mappers.getMapper(PageMapper.class);

    @Test
    void mapsPageWithRevisions() {
        Page page = Page.builder()
            .id(UUID.randomUUID())
            .spaceId(UUID.randomUUID())
            .title("Home")
            .slug("home")
            .path("/home")
            .status(PageStatus.PUBLISHED)
            .currentRevision(1)
            .createdBy(UUID.randomUUID())
            .updatedBy(UUID.randomUUID())
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .updatedAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();

        PageRevision revision = PageRevision.builder()
            .id(UUID.randomUUID())
            .pageId(page.getId())
            .number(1)
            .authorId(UUID.randomUUID())
            .content("# Home")
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();

        PageResponse response = mapper.toResponse(page, List.of(revision));

        assertThat(response.id()).isEqualTo(page.getId());
        assertThat(response.revisions()).hasSize(1);
        assertThat(response.revisions().getFirst().number()).isEqualTo(1);
    }
}
