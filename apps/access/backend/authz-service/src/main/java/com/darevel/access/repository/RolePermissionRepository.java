package com.darevel.access.repository;

import com.darevel.access.model.entity.RolePermissionEntity;
import com.darevel.access.model.entity.RolePermissionId;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface RolePermissionRepository extends JpaRepository<RolePermissionEntity, RolePermissionId> {

    @Modifying(clearAutomatically = true)
    @Query("delete from RolePermissionEntity rp where rp.id.roleId = :roleId")
    void deleteByRoleId(UUID roleId);

    @Query("select rp.permissionCode from RolePermissionEntity rp where rp.id.roleId = :roleId")
    List<String> findPermissionCodesByRoleId(UUID roleId);

    List<RolePermissionEntity> findByIdRoleIdIn(Collection<UUID> roleIds);
}
