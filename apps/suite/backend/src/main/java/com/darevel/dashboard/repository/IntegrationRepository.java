package com.darevel.dashboard.repository;

import com.darevel.dashboard.model.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, Long> {

    List<Integration> findByOwnerIdOrderByCreatedAtDesc(String ownerId);

    Optional<Integration> findByIdAndOwnerId(Long id, String ownerId);

    List<Integration> findByOwnerIdAndType(String ownerId, String type);

    List<Integration> findByOwnerIdAndStatus(String ownerId, String status);
}
