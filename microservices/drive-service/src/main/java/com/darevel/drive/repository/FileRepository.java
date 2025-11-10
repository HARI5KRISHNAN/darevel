package com.darevel.drive.repository;

import com.darevel.drive.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<FileMetadata> findByIdAndUserId(Long id, String userId);
    List<FileMetadata> findByUserIdAndFolder(String userId, String folder);
}
