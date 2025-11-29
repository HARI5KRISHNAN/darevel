package com.darevel.access.bootstrap;

import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.model.entity.RolePermissionId;
import com.darevel.access.repository.PermissionRepository;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.repository.RoleRepository;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoleTemplateInitializer {

    public static final UUID TEMPLATE_WORKSPACE_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final DefaultRoleTemplateProvider templateProvider;
    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void bootstrapTemplates() {
        templateProvider.getTemplates().forEach(this::syncTemplate);
    }

    private void syncTemplate(RoleTemplate template) {
        RoleEntity role = roleRepository
                .findByWorkspaceIdAndRoleKey(TEMPLATE_WORKSPACE_ID, template.key())
                .map(existing -> updateRole(existing, template))
                .orElseGet(() -> createRole(template));

        syncPermissions(role, template.permissions());
    }

    private RoleEntity createRole(RoleTemplate template) {
        RoleEntity role = new RoleEntity();
        role.setWorkspaceId(TEMPLATE_WORKSPACE_ID);
        role.setRoleKey(template.key());
        role.setName(template.name());
        role.setDescription(template.description());
        role.setSystem(template.system());
        role.setPriority(template.priority());
        RoleEntity saved = roleRepository.save(role);
        log.info("Created template role {}", template.key());
        return saved;
    }

    private RoleEntity updateRole(RoleEntity role, RoleTemplate template) {
        boolean dirty = false;
        if (!template.name().equals(role.getName())) {
            role.setName(template.name());
            dirty = true;
        }
        if (!template.description().equals(role.getDescription())) {
            role.setDescription(template.description());
            dirty = true;
        }
        if (template.priority() != role.getPriority()) {
            role.setPriority(template.priority());
            dirty = true;
        }
        if (template.system() != role.isSystem()) {
            role.setSystem(template.system());
            dirty = true;
        }
        if (dirty) {
            log.info("Updated template role {}", template.key());
        }
        return role;
    }

    private void syncPermissions(RoleEntity role, List<String> permissionCodes) {
        Set<String> desired = new HashSet<>(permissionCodes);
        if (desired.isEmpty()) {
            rolePermissionRepository.deleteByRoleId(role.getId());
            return;
        }
        Set<String> existing = new HashSet<>(
            permissionRepository.findByCodeIn(desired).stream()
                .map(permission -> permission.getCode())
                .toList());
        Set<String> missing = new HashSet<>(desired);
        missing.removeAll(existing);

        if (!missing.isEmpty()) {
            log.warn("Skipping unknown permissions {} for role {}", missing, role.getRoleKey());
            desired.removeAll(missing);
        }

        desired.retainAll(existing);

        rolePermissionRepository.deleteByRoleId(role.getId());

        desired.forEach(code -> {
            RolePermissionEntity entity = new RolePermissionEntity();
            entity.setId(new RolePermissionId(role.getId(), code));
            entity.setGrantedAt(OffsetDateTime.now());
            rolePermissionRepository.save(entity);
        });
    }
}
