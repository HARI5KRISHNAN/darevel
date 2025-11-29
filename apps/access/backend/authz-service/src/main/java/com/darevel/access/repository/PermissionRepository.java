package com.darevel.access.repository;

import com.darevel.access.model.entity.PermissionEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<PermissionEntity, UUID> {

    Optional<PermissionEntity> findByCode(String code);

    List<PermissionEntity> findByCodeIn(Collection<String> codes);

    List<PermissionEntity> findAllByOrderByModuleAscNameAsc();
}
