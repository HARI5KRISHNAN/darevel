package com.darevel.slides.repository;

import com.darevel.slides.model.Presentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresentationRepository extends JpaRepository<Presentation, Long> {

    List<Presentation> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);

    Optional<Presentation> findByIdAndOwnerId(Long id, String ownerId);

    List<Presentation> findByIsPublicTrue();

    Long countByOwnerId(String ownerId);
}
