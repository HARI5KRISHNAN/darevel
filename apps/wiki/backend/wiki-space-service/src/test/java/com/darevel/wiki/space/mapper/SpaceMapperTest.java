package com.darevel.wiki.space.mapper;

import com.darevel.wiki.space.domain.Space;
import com.darevel.wiki.space.domain.SpaceMember;
import com.darevel.wiki.space.domain.SpaceVisibility;
import com.darevel.wiki.space.dto.SpaceResponse;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class SpaceMapperTest {

    private final SpaceMapper mapper = Mappers.getMapper(SpaceMapper.class);

    @Test
    void mapsSpaceWithMembers() {
        Space space = Space.builder()
            .id(UUID.randomUUID())
            .key("ENG")
            .name("Engineering")
            .description("Core engineering space")
            .ownerId(UUID.randomUUID())
            .visibility(SpaceVisibility.PRIVATE)
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .updatedAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();

        SpaceMember member = SpaceMember.builder()
            .id(UUID.randomUUID())
            .space(space)
            .userId(UUID.randomUUID())
            .role(SpaceMember.Role.ADMIN)
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();

        SpaceResponse response = mapper.toResponse(space, List.of(member));

        assertThat(response.id()).isEqualTo(space.getId());
        assertThat(response.memberCount()).isEqualTo(1);
        assertThat(response.members()).hasSize(1);
        assertThat(response.members().getFirst().role()).isEqualTo("ADMIN");
    }
}
