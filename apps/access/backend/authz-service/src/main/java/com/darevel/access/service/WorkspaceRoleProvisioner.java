package com.darevel.access.service;

import com.darevel.access.bootstrap.RoleTemplateInitializer;
import com.darevel.access.model.entity.RoleEntity;
import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.model.entity.RolePermissionId;
import com.darevel.access.repository.RolePermissionRepository;
import com.darevel.access.repository.RoleRepository;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceRoleProvisioner {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;

    @Transactional
    public void ensureTemplateRoleCloned(UUID workspaceId, String templateKey) {
        if (roleRepository.existsByWorkspaceIdAndRoleKey(workspaceId, templateKey)) {
            return;
        }

        Optional<RoleEntity> template = roleRepository.findByWorkspaceIdAndRoleKey(
                RoleTemplateInitializer.TEMPLATE_WORKSPACE_ID, templateKey);

        if (template.isEmpty()) {
            log.warn("Template role {} is missing, skipping clone", templateKey);
            return;
        }

        RoleEntity templateEntity = template.get();
        RoleEntity copy = new RoleEntity();
        copy.setWorkspaceId(workspaceId);
        copy.setRoleKey(templateEntity.getRoleKey());
        copy.setName(templateEntity.getName());
        copy.setDescription(templateEntity.getDescription());
        copy.setSystem(templateEntity.isSystem());
        copy.setPriority(templateEntity.getPriority());
        copy.setCreatedBy(templateEntity.getCreatedBy());
        copy.setUpdatedBy(templateEntity.getUpdatedBy());

        RoleEntity saved = roleRepository.save(copy);

        rolePermissionRepository
                .findPermissionCodesByRoleId(templateEntity.getId())
                .forEach(code -> {
                    RolePermissionEntity entity = new RolePermissionEntity();
                    entity.setId(new RolePermissionId(saved.getId(), code));
                    entity.setGrantedAt(OffsetDateTime.now());
                    rolePermissionRepository.save(entity);
                });

        log.info("Cloned template role {} for workspace {}", templateKey, workspaceId);
    }
}
