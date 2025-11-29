package com.darevel.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.darevel.notification.domain.model.NotificationEntity;
import com.darevel.notification.domain.repository.NotificationRepository;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository repository;

    @Mock
    private NotificationMapper mapper;

    @Mock
    private NotificationWebsocketPublisher publisher;

    @InjectMocks
    private NotificationService service;

    private UUID userId;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        orgId = UUID.randomUUID();
    }

    @Test
    void markReadShouldUpdateEntities() {
        NotificationEntity entity = NotificationEntity.builder().id(UUID.randomUUID()).userId(userId).orgId(orgId).build();
        when(repository.findByIdInAndUserId(List.of(entity.getId()), userId)).thenReturn(List.of(entity));

        service.markRead(userId, List.of(entity.getId()));

        assertThat(entity.isRead()).isTrue();
        verify(repository).saveAll(List.of(entity));
    }
}
