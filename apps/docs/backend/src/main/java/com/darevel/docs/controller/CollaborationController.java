package com.darevel.docs.controller;

import com.darevel.docs.dto.CollaboratorInfo;
import com.darevel.docs.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents/{documentId}/collaborators")
@RequiredArgsConstructor
@Slf4j
public class CollaborationController {

    private final SessionService sessionService;

    @GetMapping
    public ResponseEntity<List<CollaboratorInfo>> getActiveCollaborators(@PathVariable UUID documentId) {
        log.info("Getting active collaborators for document: {}", documentId);
        List<CollaboratorInfo> collaborators = sessionService.getActiveCollaborators(documentId);
        return ResponseEntity.ok(collaborators);
    }
}
