package com.darevel.excel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpreadsheetDTO {
    private Long id;
    private String title;
    private String content;
    private Boolean isShared;
    private String sharedWith;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
