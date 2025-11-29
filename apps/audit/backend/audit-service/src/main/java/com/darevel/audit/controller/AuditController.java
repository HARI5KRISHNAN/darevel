package com.darevel.audit.controller;

import com.darevel.audit.dto.AuditLogPageResponse;
import com.darevel.audit.dto.AuditLogRequest;
import com.darevel.audit.dto.AuditLogResponse;
import com.darevel.audit.service.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit/workspaces/{workspaceId}")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @PostMapping("/logs")
    public ResponseEntity<AuditLogResponse> logEntry(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody AuditLogRequest request,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest httpRequest) {
        
        AuditLogResponse response = auditService.logEntry(workspaceId, request, httpRequest, jwt);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/logs")
    public ResponseEntity<AuditLogPageResponse> getLogs(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String userQuery,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endTime,
            @PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest httpRequest) {

        Page<AuditLogResponse> logs = auditService.getLogs(
                workspaceId,
                userId,
                userQuery,
                action,
                resourceType,
                resourceId,
                search,
                startTime,
                endTime,
                pageable,
                jwt,
                httpRequest);

        return ResponseEntity.ok(AuditLogPageResponse.from(logs));
    }

    @GetMapping("/resources/{resourceType}/{resourceId}/logs")
    public ResponseEntity<AuditLogPageResponse> getResourceLogs(
            @PathVariable UUID workspaceId,
            @PathVariable String resourceType,
            @PathVariable String resourceId,
            @PageableDefault(sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest httpRequest) {

        Page<AuditLogResponse> logs = auditService.getResourceLogs(
                workspaceId, resourceType, resourceId, pageable, jwt, httpRequest);

        return ResponseEntity.ok(AuditLogPageResponse.from(logs));
    }

    @GetMapping("/logs/export")
    public ResponseEntity<byte[]> exportLogs(
            @PathVariable UUID workspaceId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String userQuery,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endTime,
            @RequestParam(defaultValue = "5000") int limit,
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest httpRequest) {

        byte[] csv = auditService.exportLogs(
                workspaceId,
                userId,
                userQuery,
                action,
                resourceType,
                resourceId,
                search,
                startTime,
                endTime,
                limit,
                jwt,
                httpRequest);

        String filename = "audit_export_" + DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss").format(OffsetDateTime.now()) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
