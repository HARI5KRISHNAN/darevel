package com.darevel.access.service;

import com.darevel.access.model.entity.ResourcePermissionEntity;
import com.darevel.access.model.enums.ResourceType;
import com.darevel.access.model.enums.SubjectType;
import com.darevel.access.repository.PermissionRepository;
import com.darevel.access.repository.ResourcePermissionRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResourcePermissionService {

    private final ResourcePermissionRepository resourcePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final PermissionCacheService permissionCacheService;

    @Transactional
    public ResourcePermissionEntity grantPermission(
            UUID workspaceId,
            String resourceId,
            ResourceType resourceType,
            UUID subjectId,
            SubjectType subjectType,
            String permissionCode,
            UUID actorId) {

        permissionRepository
                .findByCode(permissionCode)
                .orElseThrow(() -> new IllegalArgumentException("Unknown permission code"));

        ResourcePermissionEntity entity = new ResourcePermissionEntity();
        entity.setWorkspaceId(workspaceId);
        entity.setResourceId(resourceId);
        entity.setResourceType(resourceType);
        entity.setSubjectId(subjectId);
        entity.setSubjectType(subjectType);
        entity.setPermissionCode(permissionCode);
        entity.setGrantedBy(actorId);

        ResourcePermissionEntity saved = resourcePermissionRepository.save(entity);
        if (subjectType == SubjectType.USER) {
            permissionCacheService.evictUser(workspaceId, subjectId);
        }
        return saved;
    }

    @Transactional
    public void revokePermission(
            UUID workspaceId,
            String resourceId,
            ResourceType resourceType,
            UUID subjectId,
            SubjectType subjectType,
            String permissionCode) {
        resourcePermissionRepository.deleteByWorkspaceIdAndResourceIdAndResourceTypeAndSubjectIdAndSubjectTypeAndPermissionCode(
                workspaceId, resourceId, resourceType, subjectId, subjectType, permissionCode);
        if (subjectType == SubjectType.USER) {
            permissionCacheService.evictUser(workspaceId, subjectId);
        }
    }

    public List<ResourcePermissionEntity> listResourcePermissions(
            UUID workspaceId, String resourceId, ResourceType resourceType) {
        return resourcePermissionRepository.findByWorkspaceIdAndResourceIdAndResourceType(workspaceId, resourceId, resourceType);
    }
}
