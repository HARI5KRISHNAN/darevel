package com.darevel.access.repository;

import com.darevel.access.model.entity.ResourcePermissionEntity;
import com.darevel.access.model.enums.ResourceType;
import com.darevel.access.model.enums.SubjectType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourcePermissionRepository extends JpaRepository<ResourcePermissionEntity, UUID> {

    List<ResourcePermissionEntity> findByWorkspaceIdAndResourceId(UUID workspaceId, String resourceId);

    List<ResourcePermissionEntity> findByWorkspaceIdAndResourceIdAndResourceType(
            UUID workspaceId, String resourceId, ResourceType resourceType);

    void deleteByWorkspaceIdAndResourceIdAndResourceTypeAndSubjectIdAndSubjectTypeAndPermissionCode(
            UUID workspaceId,
            String resourceId,
            ResourceType resourceType,
            UUID subjectId,
            SubjectType subjectType,
            String permissionCode);
}
