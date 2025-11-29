package com.darevel.docs.controller;

import com.darevel.docs.dto.CreateDocumentRequest;
import com.darevel.docs.dto.DocumentListItem;
import com.darevel.docs.dto.DocumentResponse;
import com.darevel.docs.dto.UpdateDocumentRequest;
import com.darevel.docs.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(
            @Valid @RequestBody CreateDocumentRequest request) {
        log.info("Creating document: {}", request.getTitle());
        DocumentResponse response = documentService.createDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable UUID documentId) {
        log.info("Getting document: {}", documentId);
        DocumentResponse response = documentService.getDocument(documentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentListItem>> listDocuments(
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) String search) {
        log.info("Listing documents: orgId={}, search={}", orgId, search);

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(documentService.searchDocuments(search, orgId));
        }

        return ResponseEntity.ok(documentService.listDocuments(orgId));
    }

    @PutMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateDocumentRequest request) {
        log.info("Updating document: {}", documentId);
        DocumentResponse response = documentService.updateDocument(documentId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID documentId) {
        log.info("Deleting document: {}", documentId);
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
