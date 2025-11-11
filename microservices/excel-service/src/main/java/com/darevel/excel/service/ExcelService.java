package com.darevel.excel.service;

import com.darevel.excel.dto.SpreadsheetDTO;
import com.darevel.excel.entity.Spreadsheet;
import com.darevel.excel.repository.SpreadsheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExcelService {

    private final SpreadsheetRepository spreadsheetRepository;

    @Transactional(readOnly = true)
    public List<SpreadsheetDTO> getSpreadsheets(Jwt jwt) {
        String userId = jwt.getSubject();
        List<Spreadsheet> spreadsheets = spreadsheetRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return spreadsheets.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpreadsheetDTO getSpreadsheetById(Jwt jwt, Long id) {
        String userId = jwt.getSubject();
        Spreadsheet spreadsheet = spreadsheetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Spreadsheet not found"));
        return mapToDTO(spreadsheet);
    }

    @Transactional
    public SpreadsheetDTO createSpreadsheet(Jwt jwt, SpreadsheetDTO dto) {
        String userId = jwt.getSubject();
        Spreadsheet spreadsheet = Spreadsheet.builder()
                .userId(userId)
                .title(dto.getTitle())
                .content(dto.getContent())
                .isShared(dto.getIsShared() != null ? dto.getIsShared() : false)
                .sharedWith(dto.getSharedWith())
                .build();
        spreadsheet = spreadsheetRepository.save(spreadsheet);
        return mapToDTO(spreadsheet);
    }

    @Transactional
    public SpreadsheetDTO updateSpreadsheet(Jwt jwt, Long id, SpreadsheetDTO dto) {
        String userId = jwt.getSubject();
        Spreadsheet spreadsheet = spreadsheetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Spreadsheet not found"));

        if (dto.getTitle() != null) spreadsheet.setTitle(dto.getTitle());
        if (dto.getContent() != null) spreadsheet.setContent(dto.getContent());
        if (dto.getIsShared() != null) spreadsheet.setIsShared(dto.getIsShared());
        if (dto.getSharedWith() != null) spreadsheet.setSharedWith(dto.getSharedWith());

        spreadsheet = spreadsheetRepository.save(spreadsheet);
        return mapToDTO(spreadsheet);
    }

    @Transactional
    public void deleteSpreadsheet(Jwt jwt, Long id) {
        String userId = jwt.getSubject();
        Spreadsheet spreadsheet = spreadsheetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Spreadsheet not found"));
        spreadsheetRepository.delete(spreadsheet);
    }

    private SpreadsheetDTO mapToDTO(Spreadsheet spreadsheet) {
        return SpreadsheetDTO.builder()
                .id(spreadsheet.getId())
                .title(spreadsheet.getTitle())
                .content(spreadsheet.getContent())
                .isShared(spreadsheet.getIsShared())
                .sharedWith(spreadsheet.getSharedWith())
                .createdAt(spreadsheet.getCreatedAt())
                .updatedAt(spreadsheet.getUpdatedAt())
                .build();
    }
}
