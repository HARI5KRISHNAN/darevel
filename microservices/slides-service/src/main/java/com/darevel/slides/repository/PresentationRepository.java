package com.darevel.slides.repository;

import com.darevel.slides.entity.Presentation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PresentationRepository extends JpaRepository<Presentation, Long> {

    List<Presentation> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<Presentation> findByIdAndUserId(Long id, String userId);
}
