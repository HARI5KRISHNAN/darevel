package com.darevel.drive.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "original_name", nullable = false)
    private String originalName;

    @Column(name = "mimetype")
    private String mimetype;

    @Column(name = "size")
    private Long size;

    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "folder")
    @Builder.Default
    private String folder = "/";

    @Column(name = "is_shared")
    @Builder.Default
    private Boolean isShared = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
