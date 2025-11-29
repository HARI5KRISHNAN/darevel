package com.darevel.audit.service;

import com.darevel.audit.config.TenantResolver;
import com.darevel.audit.dto.AuditLogRequest;
import com.darevel.audit.dto.AuditLogResponse;
import com.darevel.audit.entity.AuditLogEntry;
import com.darevel.audit.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final TenantResolver tenantResolver;

    @Transactional
    public AuditLogResponse logEntry(UUID workspaceId, AuditLogRequest request,
                                     HttpServletRequest httpRequest, Jwt jwt) {
        UUID resolvedWorkspaceId = tenantResolver.resolveOrgId(jwt, 
            httpRequest.getHeader("X-Organization-ID"));

        if (!resolvedWorkspaceId.equals(workspaceId)) {
            throw new SecurityException("Workspace ID mismatch");
        }

        AuditLogEntry entry = AuditLogEntry.builder()
                .workspaceId(workspaceId)
                .userId(request.getUserId())
                .userName(request.getUserName())
                .userEmail(request.getUserEmail())
                .action(request.getAction())
                .resourceType(request.getResourceType())
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .description(request.getDescription())
                .ipAddress(extractIpAddress(httpRequest))
                .macAddress(resolveMacAddress(httpRequest, request.getMacAddress()))
                .userAgent(httpRequest.getHeader("User-Agent"))
                .metadata(request.getMetadata())
                .timestamp(OffsetDateTime.now())
                .build();

        AuditLogEntry saved = auditLogRepository.save(entry);
        log.debug("Logged audit entry: workspace={}, user={}, action={}", 
                  workspaceId, request.getUserId(), request.getAction());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(
            UUID workspaceId,
            UUID userId,
            String userQuery,
            String action,
            String resourceType,
            String resourceId,
            String searchTerm,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            Pageable pageable,
            Jwt jwt,
            HttpServletRequest httpRequest) {

        tenantResolver.assertSameOrg(workspaceId, jwt, httpRequest.getHeader("X-Organization-ID"));

        Page<AuditLogEntry> entries = auditLogRepository.searchLogs(
                workspaceId,
                userId,
                normalize(action),
                normalize(resourceType),
                normalize(resourceId),
                normalize(userQuery),
                normalize(searchTerm),
                startTime,
                endTime,
                pageable);

        return entries.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getResourceLogs(
            UUID workspaceId,
            String resourceType,
            String resourceId,
            Pageable pageable,
            Jwt jwt,
            HttpServletRequest httpRequest) {

        return getLogs(
                workspaceId,
                null,
                null,
                null,
                resourceType,
                resourceId,
                null,
                null,
                null,
                pageable,
                jwt,
                httpRequest);
    }

    @Transactional(readOnly = true)
    public byte[] exportLogs(
            UUID workspaceId,
            UUID userId,
            String userQuery,
            String action,
            String resourceType,
            String resourceId,
            String searchTerm,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            int limit,
            Jwt jwt,
            HttpServletRequest httpRequest) {

        tenantResolver.assertSameOrg(workspaceId, jwt, httpRequest.getHeader("X-Organization-ID"));

        int effectiveLimit = Math.min(Math.max(limit, 100), 5000);
        Pageable pageable = PageRequest.of(0, effectiveLimit, Sort.by(Sort.Direction.DESC, "timestamp"));

        List<AuditLogEntry> logs = auditLogRepository.searchLogs(
                        workspaceId,
                        userId,
                        normalize(action),
                        normalize(resourceType),
                        normalize(resourceId),
                        normalize(userQuery),
                        normalize(searchTerm),
                        startTime,
                        endTime,
                        pageable)
                .getContent();

        StringBuilder builder = new StringBuilder();
        builder.append("ID,Timestamp,Action,Resource Type,Resource Name,Resource ID,User,User Email,IP Address,MAC Address,Description\n");
        DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

        for (AuditLogEntry entry : logs) {
            builder.append(csv(entry.getId()))
                    .append(',')
                    .append(csv(formatter.format(entry.getTimestamp())))
                    .append(',')
                    .append(csv(entry.getAction()))
                    .append(',')
                    .append(csv(entry.getResourceType()))
                    .append(',')
                    .append(csv(entry.getResourceName()))
                    .append(',')
                    .append(csv(entry.getResourceId()))
                    .append(',')
                    .append(csv(entry.getUserName()))
                    .append(',')
                    .append(csv(entry.getUserEmail()))
                    .append(',')
                    .append(csv(entry.getIpAddress()))
                    .append(',')
                    .append(csv(entry.getMacAddress()))
                    .append(',')
                    .append(csv(entry.getDescription()))
                    .append('\n');
        }

        return builder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String extractIpAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveMacAddress(HttpServletRequest request, String override) {
        if (StringUtils.hasText(override)) {
            return override.trim();
        }
        String header = request.getHeader("X-Device-MAC");
        return StringUtils.hasText(header) ? header.trim() : null;
    }

    private AuditLogResponse mapToResponse(AuditLogEntry entry) {
        return AuditLogResponse.builder()
                .id(entry.getId())
                .workspaceId(entry.getWorkspaceId())
                .userId(entry.getUserId())
                .userName(entry.getUserName())
                .userEmail(entry.getUserEmail())
                .action(entry.getAction())
                .resourceType(entry.getResourceType())
                .resourceId(entry.getResourceId())
                .resourceName(entry.getResourceName())
                .description(entry.getDescription())
                .ipAddress(entry.getIpAddress())
                .macAddress(entry.getMacAddress())
                .userAgent(entry.getUserAgent())
                .metadata(entry.getMetadata())
                .timestamp(entry.getTimestamp())
                .build();
    }

    private String normalize(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String csv(Object value) {
        String str = value == null ? "" : value.toString();
        String escaped = str.replace("\"", "\"\"");
        return '"' + escaped + '"';
    }
}
