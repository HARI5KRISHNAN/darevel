package com.darevel.admin.repository;

import com.darevel.admin.entity.TeamMemberEntity;
import com.darevel.admin.model.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMemberEntity, UUID> {
    List<TeamMemberEntity> findByTeam_Id(UUID teamId);
    long countByTeam_Id(UUID teamId);
    boolean existsByTeam_IdAndUserId(UUID teamId, UUID userId);
    void deleteByTeam_Id(UUID teamId);
    Optional<TeamMemberEntity> findByTeam_IdAndUserId(UUID teamId, UUID userId);
    List<TeamMemberEntity> findByOrgIdAndUserId(UUID orgId, UUID userId);
    List<TeamMemberEntity> findByOrgId(UUID orgId);
    List<TeamMemberEntity> findByTeam_IdAndRole(UUID teamId, TeamRole role);
}
