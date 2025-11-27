package com.darevel.spreadsheet.repository;

import com.darevel.spreadsheet.model.Sheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SheetRepository extends JpaRepository<Sheet, Long> {
    List<Sheet> findByOwnerId(String ownerId);
    List<Sheet> findByOwnerIdOrderByUpdatedAtDesc(String ownerId);
    Optional<Sheet> findByIdAndOwnerId(Long id, String ownerId);
    Optional<Sheet> findByShareToken(String shareToken);
    List<Sheet> findAllByOrderByUpdatedAtDesc();
}
