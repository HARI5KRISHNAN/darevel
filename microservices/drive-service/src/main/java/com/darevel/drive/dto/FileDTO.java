package com.darevel.drive.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileDTO {
    private Long id;
    private String filename;
    private String mimetype;
    private Long size;
    private String folder;
    private Boolean isShared;
    private LocalDateTime createdAt;
}
