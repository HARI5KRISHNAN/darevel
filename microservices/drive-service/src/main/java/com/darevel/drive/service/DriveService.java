package com.darevel.drive.service;

import com.darevel.common.exception.ResourceNotFoundException;
import com.darevel.drive.dto.FileDTO;
import com.darevel.drive.entity.FileMetadata;
import com.darevel.drive.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriveService {

    private final FileRepository fileRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Transactional
    public FileDTO uploadFile(MultipartFile file, Jwt jwt) throws IOException {
        String userId = jwt.getSubject();

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = FilenameUtils.getExtension(originalFilename);
        String filename = UUID.randomUUID() + "." + extension;

        // Save file to disk
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Save metadata to database
        FileMetadata metadata = FileMetadata.builder()
                .userId(userId)
                .filename(filename)
                .originalName(originalFilename)
                .mimetype(file.getContentType())
                .size(file.getSize())
                .path(filePath.toString())
                .build();

        FileMetadata saved = fileRepository.save(metadata);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<FileDTO> getUserFiles(Jwt jwt) {
        String userId = jwt.getSubject();
        return fileRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource downloadFile(Long fileId, Jwt jwt) throws IOException {
        String userId = jwt.getSubject();
        FileMetadata metadata = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));

        Path filePath = Paths.get(metadata.getPath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found or not readable");
        }
    }

    @Transactional
    public void deleteFile(Long fileId, Jwt jwt) throws IOException {
        String userId = jwt.getSubject();
        FileMetadata metadata = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));

        // Delete file from disk
        Path filePath = Paths.get(metadata.getPath());
        Files.deleteIfExists(filePath);

        // Delete metadata from database
        fileRepository.delete(metadata);
    }

    private FileDTO mapToDTO(FileMetadata metadata) {
        return FileDTO.builder()
                .id(metadata.getId())
                .filename(metadata.getOriginalName())
                .mimetype(metadata.getMimetype())
                .size(metadata.getSize())
                .folder(metadata.getFolder())
                .isShared(metadata.getIsShared())
                .createdAt(metadata.getCreatedAt())
                .build();
    }
}
