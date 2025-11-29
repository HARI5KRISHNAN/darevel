package com.darevel.wiki.content.controller;

import com.darevel.wiki.content.dto.AcquireLockRequest;
import com.darevel.wiki.content.dto.LockResponse;
import com.darevel.wiki.content.dto.ReleaseLockRequest;
import com.darevel.wiki.content.service.ContentLockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/wiki/content/locks")
@RequiredArgsConstructor
@Validated
public class LockController {

    private final ContentLockService lockService;

    @PostMapping
    public LockResponse acquireLock(@Valid @RequestBody AcquireLockRequest request) {
        return lockService.acquireLock(request);
    }

    @DeleteMapping
    public ResponseEntity<Void> releaseLock(@Valid @RequestBody ReleaseLockRequest request) {
        lockService.releaseLock(request.pageId(), request.userId(), request.sessionId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{pageId}")
    public LockResponse getLockStatus(@PathVariable UUID pageId) {
        return lockService.getLockStatus(pageId);
    }
}
