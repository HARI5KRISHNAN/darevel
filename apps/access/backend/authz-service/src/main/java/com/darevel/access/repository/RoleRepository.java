package com.darevel.access.repository;

import com.darevel.access.model.entity.RoleEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<RoleEntity, UUID> {

    List<RoleEntity> findByWorkspaceIdOrderByPriorityAsc(UUID workspaceId);

    Optional<RoleEntity> findByWorkspaceIdAndRoleKey(UUID workspaceId, String roleKey);

    boolean existsByWorkspaceIdAndRoleKey(UUID workspaceId, String roleKey);
}
