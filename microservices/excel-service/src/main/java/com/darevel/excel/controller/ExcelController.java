package com.darevel.excel.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.excel.dto.SpreadsheetDTO;
import com.darevel.excel.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpreadsheetDTO>>> getSpreadsheets(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        List<SpreadsheetDTO> spreadsheets = excelService.getSpreadsheets(jwt);
        return ResponseEntity.ok(ApiResponse.success(spreadsheets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpreadsheetDTO>> getSpreadsheet(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        SpreadsheetDTO spreadsheet = excelService.getSpreadsheetById(jwt, id);
        return ResponseEntity.ok(ApiResponse.success(spreadsheet));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SpreadsheetDTO>> createSpreadsheet(
            Authentication authentication,
            @RequestBody SpreadsheetDTO dto) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        SpreadsheetDTO spreadsheet = excelService.createSpreadsheet(jwt, dto);
        return ResponseEntity.ok(ApiResponse.success("Spreadsheet created", spreadsheet));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SpreadsheetDTO>> updateSpreadsheet(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody SpreadsheetDTO dto) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        SpreadsheetDTO spreadsheet = excelService.updateSpreadsheet(jwt, id, dto);
        return ResponseEntity.ok(ApiResponse.success("Spreadsheet updated", spreadsheet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpreadsheet(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        excelService.deleteSpreadsheet(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Spreadsheet deleted", null));
    }
}
