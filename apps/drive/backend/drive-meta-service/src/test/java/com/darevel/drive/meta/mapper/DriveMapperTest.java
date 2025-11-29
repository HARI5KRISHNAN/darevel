package com.darevel.drive.meta.mapper;

import com.darevel.drive.meta.domain.DriveFileVersion;
import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.domain.NodeType;
import com.darevel.drive.meta.domain.SpaceType;
import com.darevel.drive.meta.dto.NodeResponse;
import com.darevel.drive.meta.dto.NodeSummaryResponse;
import com.darevel.drive.meta.dto.SpaceResponse;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class DriveMapperTest {

    private final DriveMapper mapper = Mappers.getMapper(DriveMapper.class);

    @Test
    void mapsNodeResponseWithVersions() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode node = DriveNode.builder()
            .id(UUID.randomUUID())
            .spaceId(UUID.randomUUID())
            .name("Specs.pdf")
            .nodeType(NodeType.FILE)
            .mimeType("application/pdf")
            .sizeBytes(1024)
            .ownerId(UUID.randomUUID())
            .createdAt(now)
            .updatedAt(now)
            .build();

        DriveFileVersion version = DriveFileVersion.builder()
            .id(UUID.randomUUID())
            .nodeId(node.getId())
            .versionNumber(1)
            .storageKey("minio://drive/specs.pdf")
            .sizeBytes(1024)
            .checksum("abc123")
            .createdBy(UUID.randomUUID())
            .createdAt(now)
            .comment("Initial upload")
            .build();

        NodeResponse response = mapper.toNodeResponse(node, true, List.of(version));

        assertThat(response.starred()).isTrue();
        assertThat(response.versions()).hasSize(1);
        assertThat(response.versions().get(0).storageKey()).contains("specs");
    }

    @Test
    void mapsNodeSummaryWithTrashFlag() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode node = DriveNode.builder()
            .id(UUID.randomUUID())
            .spaceId(UUID.randomUUID())
            .name("Archive")
            .nodeType(NodeType.FOLDER)
            .sizeBytes(0)
            .ownerId(UUID.randomUUID())
            .createdAt(now)
            .updatedAt(now)
            .deletedAt(now)
            .build();

        NodeSummaryResponse summary = mapper.toNodeSummary(node, false);

        assertThat(summary.trashed()).isTrue();
        assertThat(summary.nodeType()).isEqualTo(NodeType.FOLDER);
    }

    @Test
    void mapsSpaceResponse() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveSpace space = DriveSpace.builder()
            .id(UUID.randomUUID())
            .ownerId(UUID.randomUUID())
            .name("Brand Studio")
            .type(SpaceType.TEAM)
            .createdAt(now)
            .updatedAt(now)
            .build();

        SpaceResponse response = mapper.toSpaceResponse(space);

        assertThat(response.name()).isEqualTo("Brand Studio");
        assertThat(response.type()).isEqualTo(SpaceType.TEAM);
    }
}
