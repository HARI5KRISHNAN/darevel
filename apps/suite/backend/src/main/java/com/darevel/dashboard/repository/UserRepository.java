package com.darevel.dashboard.repository;

import com.darevel.dashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByKeycloakId(String keycloakId);

    Optional<User> findByEmail(String email);

    Boolean existsByKeycloakId(String keycloakId);

    Boolean existsByEmail(String email);
}
