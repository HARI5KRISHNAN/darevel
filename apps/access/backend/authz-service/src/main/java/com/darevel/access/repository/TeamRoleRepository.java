package com.darevel.access.repository;

import com.darevel.access.model.entity.TeamRoleEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamRoleRepository extends JpaRepository<TeamRoleEntity, UUID> {

    List<TeamRoleEntity> findByWorkspaceIdAndTeamId(UUID workspaceId, UUID teamId);

    boolean existsByWorkspaceIdAndTeamIdAndRoleId(UUID workspaceId, UUID teamId, UUID roleId);

    void deleteByWorkspaceIdAndTeamIdAndRoleId(UUID workspaceId, UUID teamId, UUID roleId);

    Optional<TeamRoleEntity> findByWorkspaceIdAndTeamIdAndRoleId(UUID workspaceId, UUID teamId, UUID roleId);

    boolean existsByWorkspaceIdAndRoleId(UUID workspaceId, UUID roleId);
}
