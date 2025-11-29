package com.darevel.access.bootstrap;

import com.darevel.access.catalog.PermissionCatalog;
import com.darevel.access.catalog.PermissionDefinition;
import com.darevel.access.model.entity.PermissionEntity;
import com.darevel.access.repository.PermissionRepository;
import java.time.OffsetDateTime;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionCatalogInitializer {

    private final PermissionCatalog permissionCatalog;
    private final PermissionRepository permissionRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void syncPermissionCatalog() {
        permissionCatalog.getDefinitions().forEach(this::syncDefinition);
    }

    private void syncDefinition(PermissionDefinition definition) {
        permissionRepository
                .findByCode(definition.code())
                .ifPresentOrElse(entity -> updateEntity(entity, definition), () -> createEntity(definition));
    }

    private void updateEntity(PermissionEntity entity, PermissionDefinition definition) {
        boolean dirty = false;
        if (!definition.name().equals(entity.getName())) {
            entity.setName(definition.name());
            dirty = true;
        }
        if (!Objects.equals(definition.description(), entity.getDescription())) {
            entity.setDescription(definition.description());
            dirty = true;
        }
        if (!definition.module().equals(entity.getModule())) {
            entity.setModule(definition.module());
            dirty = true;
        }
        if (dirty) {
            entity.setUpdatedAt(OffsetDateTime.now());
            log.info("Updated permission definition {}", entity.getCode());
        }
    }

    private void createEntity(PermissionDefinition definition) {
        PermissionEntity entity = new PermissionEntity();
        entity.setCode(definition.code());
        entity.setName(definition.name());
        entity.setDescription(definition.description());
        entity.setModule(definition.module());
        permissionRepository.save(entity);
        log.info("Created permission definition {}", definition.code());
    }
}
