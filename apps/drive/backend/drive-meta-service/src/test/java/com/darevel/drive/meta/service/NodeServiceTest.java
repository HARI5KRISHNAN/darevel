package com.darevel.drive.meta.service;

import com.darevel.drive.meta.domain.DriveNode;
import com.darevel.drive.meta.domain.DriveSpace;
import com.darevel.drive.meta.domain.DriveStar;
import com.darevel.drive.meta.domain.NodeType;
import com.darevel.drive.meta.domain.SpaceType;
import com.darevel.drive.meta.dto.NodeSummaryResponse;
import com.darevel.drive.meta.mapper.DriveMapper;
import com.darevel.drive.meta.repository.DriveFileVersionRepository;
import com.darevel.drive.meta.repository.DriveNodeRepository;
import com.darevel.drive.meta.repository.DriveStarRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NodeServiceTest {

    @Mock
    private DriveNodeRepository nodeRepository;

    @Mock
    private DriveFileVersionRepository versionRepository;

    @Mock
    private DriveStarRepository starRepository;

    @Mock
    private SpaceService spaceService;

    @Mock
    private NodeEventPublisher eventPublisher;

    private final DriveMapper mapper = Mappers.getMapper(DriveMapper.class);

    private NodeService nodeService;

    @BeforeEach
    void setUp() {
        nodeService = new NodeService(
            nodeRepository,
            versionRepository,
            starRepository,
            mapper,
            spaceService,
            eventPublisher
        );
    }

    @Test
    void listTrashedNodesReturnsSummaries() {
        UUID spaceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode trashed = createNode(UUID.randomUUID(), now, now);

        when(spaceService.getSpace(spaceId)).thenReturn(createSpace(spaceId));
        when(nodeRepository.findAllBySpaceIdAndDeletedAtIsNotNullOrderByUpdatedAtDesc(spaceId))
            .thenReturn(List.of(trashed));
        when(starRepository.findAllByUserId(userId)).thenReturn(List.of());

        List<NodeSummaryResponse> summaries = nodeService.listTrashedNodes(spaceId, userId);

        Assertions.assertThat(summaries).hasSize(1);
        Assertions.assertThat(summaries.get(0).trashed()).isTrue();
        verify(spaceService).getSpace(spaceId);
    }

    @Test
    void listRecentNodesClampsLimitToMax() {
        UUID ownerId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveNode node = createNode(UUID.randomUUID(), now, null);

        when(nodeRepository.findAllByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(eq(ownerId), any(PageRequest.class)))
            .thenReturn(List.of(node));
        when(starRepository.findAllByUserId(ownerId)).thenReturn(List.of());

        nodeService.listRecentNodes(ownerId, 500);

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(nodeRepository).findAllByOwnerIdAndDeletedAtIsNullOrderByUpdatedAtDesc(eq(ownerId), pageableCaptor.capture());
        Assertions.assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(50);
    }

    @Test
    void listStarredNodesSkipsDeletedEntries() {
        UUID userId = UUID.randomUUID();
        UUID activeNodeId = UUID.randomUUID();
        UUID deletedNodeId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        DriveStar activeStar = DriveStar.builder().nodeId(activeNodeId).userId(userId).createdAt(now).build();
        DriveStar deletedStar = DriveStar.builder().nodeId(deletedNodeId).userId(userId).createdAt(now).build();

        when(starRepository.findAllByUserId(userId)).thenReturn(List.of(activeStar, deletedStar));
        when(nodeRepository.findAllById(ArgumentMatchers.<Iterable<UUID>>any()))
            .thenReturn(List.of(
                createNode(activeNodeId, now, null),
                createNode(deletedNodeId, now.minusDays(1), now.minusDays(1))
            ));

        List<NodeSummaryResponse> summaries = nodeService.listStarredNodes(userId);

        Assertions.assertThat(summaries).hasSize(1);
        Assertions.assertThat(summaries.get(0).id()).isEqualTo(activeNodeId);
        Assertions.assertThat(summaries.get(0).starred()).isTrue();
    }

    private DriveNode createNode(UUID id, OffsetDateTime updatedAt, OffsetDateTime deletedAt) {
        return DriveNode.builder()
            .id(id)
            .spaceId(UUID.randomUUID())
            .parentId(null)
            .name("Node-" + id.toString().substring(0, 8))
            .nodeType(NodeType.FILE)
            .mimeType("text/plain")
            .sizeBytes(1024)
            .ownerId(UUID.randomUUID())
            .storageKey("storage://" + id)
            .deletedAt(deletedAt)
            .createdAt(updatedAt.minusMinutes(5))
            .updatedAt(updatedAt)
            .build();
    }

    private DriveSpace createSpace(UUID spaceId) {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return DriveSpace.builder()
            .id(spaceId)
            .ownerId(UUID.randomUUID())
            .name("Space")
            .type(SpaceType.TEAM)
            .createdAt(now)
            .updatedAt(now)
            .build();
    }
}
