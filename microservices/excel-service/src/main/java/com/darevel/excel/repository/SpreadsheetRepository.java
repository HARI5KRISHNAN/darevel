package com.darevel.excel.repository;

import com.darevel.excel.entity.Spreadsheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpreadsheetRepository extends JpaRepository<Spreadsheet, Long> {

    List<Spreadsheet> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<Spreadsheet> findByIdAndUserId(Long id, String userId);
}
