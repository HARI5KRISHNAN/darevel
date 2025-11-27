package com.darevel.mail.repository;

import com.darevel.mail.model.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {

    List<Draft> findByUserEmailOrderByUpdatedAtDesc(String userEmail);

    Optional<Draft> findByIdAndUserEmail(Long id, String userEmail);

    int countByUserEmail(String userEmail);

    void deleteByIdAndUserEmail(Long id, String userEmail);
}
