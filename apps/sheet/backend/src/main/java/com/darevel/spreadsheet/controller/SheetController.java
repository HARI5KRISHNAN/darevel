package com.darevel.spreadsheet.controller;

import com.darevel.spreadsheet.dto.MessageResponse;
import com.darevel.spreadsheet.dto.SheetRequest;
import com.darevel.spreadsheet.dto.SheetResponse;
import com.darevel.spreadsheet.model.Sheet;
import com.darevel.spreadsheet.repository.SheetRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/sheets")
public class SheetController {

    @Autowired
    private SheetRepository sheetRepository;

    private SheetResponse convertToResponse(Sheet sheet) {
        return new SheetResponse(
                sheet.getId(),
                sheet.getName(),
                sheet.getData(),
                sheet.getMerges(),
                sheet.getLastSavedAt(),
                sheet.getCreatedAt(),
                sheet.getUpdatedAt()
        );
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveSheet(@Valid @RequestBody SheetRequest sheetRequest) {
        try {
            Sheet sheet = new Sheet();
            sheet.setName(sheetRequest.getName());
            sheet.setData(sheetRequest.getData());
            sheet.setMerges(sheetRequest.getMerges());
            sheet.setLastSavedAt(LocalDateTime.now());

            Sheet savedSheet = sheetRepository.save(sheet);

            return ResponseEntity.ok(convertToResponse(savedSheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error saving sheet: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSheet(@PathVariable Long id, @Valid @RequestBody SheetRequest sheetRequest) {
        try {
            Sheet sheet = sheetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            sheet.setName(sheetRequest.getName());
            sheet.setData(sheetRequest.getData());
            sheet.setMerges(sheetRequest.getMerges());
            sheet.setLastSavedAt(LocalDateTime.now());

            Sheet updatedSheet = sheetRepository.save(sheet);

            return ResponseEntity.ok(convertToResponse(updatedSheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error updating sheet: " + e.getMessage()));
        }
    }

    @GetMapping("/load")
    public ResponseEntity<?> getAllSheets() {
        try {
            List<Sheet> sheets = sheetRepository.findAllByOrderByUpdatedAtDesc();

            List<SheetResponse> responses = sheets.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error loading sheets: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSheet(@PathVariable Long id) {
        try {
            Sheet sheet = sheetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            return ResponseEntity.ok(convertToResponse(sheet));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error loading sheet: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSheet(@PathVariable Long id) {
        try {
            Sheet sheet = sheetRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Sheet not found"));

            sheetRepository.delete(sheet);

            return ResponseEntity.ok(new MessageResponse("Sheet deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error deleting sheet: " + e.getMessage()));
        }
    }
}
