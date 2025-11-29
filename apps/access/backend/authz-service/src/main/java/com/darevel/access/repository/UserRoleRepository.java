package com.darevel.access.repository;

import com.darevel.access.model.entity.UserRoleEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRoleEntity, UUID> {

    List<UserRoleEntity> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    boolean existsByWorkspaceIdAndUserIdAndRoleId(UUID workspaceId, UUID userId, UUID roleId);

    void deleteByWorkspaceIdAndUserIdAndRoleId(UUID workspaceId, UUID userId, UUID roleId);

    Optional<UserRoleEntity> findByWorkspaceIdAndUserIdAndRoleId(UUID workspaceId, UUID userId, UUID roleId);

    @Query("select ur.userId from UserRoleEntity ur where ur.workspaceId = :workspaceId and ur.role.id = :roleId")
    List<UUID> findUserIdsByWorkspaceIdAndRoleId(
            @Param("workspaceId") UUID workspaceId, @Param("roleId") UUID roleId);
}
