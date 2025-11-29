package com.darevel.admin.repository;

import com.darevel.admin.entity.SecurityPolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SecurityPolicyRepository extends JpaRepository<SecurityPolicyEntity, UUID> {
    Optional<SecurityPolicyEntity> findByOrgId(UUID orgId);
}
