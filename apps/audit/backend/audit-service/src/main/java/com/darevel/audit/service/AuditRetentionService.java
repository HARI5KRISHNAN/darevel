package com.darevel.audit.service;

import com.darevel.audit.config.AuditProperties;
import com.darevel.audit.entity.AuditLogEntry;
import com.darevel.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "audit.retention", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AuditRetentionService {

    private final AuditLogRepository auditLogRepository;
    private final AuditProperties auditProperties;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Scheduled(cron = "${audit.export.schedule:0 0 2 * * *}")
    @Transactional
    public void performRetentionAndExport() {
        if (!auditProperties.getRetention().isEnabled()) {
            return;
        }

        log.info("Starting audit log retention and export process");

        try {
            // Export logs before deletion
            if (auditProperties.getExport().isEnabled()) {
                exportOldLogs();
            }

            // Delete old logs
            deleteOldLogs();

            log.info("Audit log retention and export completed successfully");
        } catch (Exception e) {
            log.error("Failed to perform audit retention and export", e);
        }
    }

    private void exportOldLogs() {
        int retentionDays = auditProperties.getRetention().getDays();
        OffsetDateTime cutoffTime = OffsetDateTime.now().minusDays(retentionDays);
        
        List<AuditLogEntry> oldLogs = auditLogRepository.findOlderThan(cutoffTime);
        
        if (oldLogs.isEmpty()) {
            log.info("No audit logs to export");
            return;
        }

        try {
            String exportPath = auditProperties.getExport().getPath();
            Path exportDir = Paths.get(exportPath);
            Files.createDirectories(exportDir);

            String filename = String.format("audit_export_%s.json", LocalDate.now());
            File exportFile = exportDir.resolve(filename).toFile();

            try (FileWriter writer = new FileWriter(exportFile)) {
                objectMapper.writerWithDefaultPrettyPrinter().writeValue(writer, oldLogs);
            }

            log.info("Exported {} audit logs to {}", oldLogs.size(), exportFile.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to export audit logs", e);
            throw new RuntimeException("Failed to export audit logs", e);
        }
    }

    @Transactional
    public void deleteOldLogs() {
        int retentionDays = auditProperties.getRetention().getDays();
        OffsetDateTime cutoffTime = OffsetDateTime.now().minusDays(retentionDays);
        
        long countBefore = auditLogRepository.count();
        auditLogRepository.deleteByTimestampBefore(cutoffTime);
        long countAfter = auditLogRepository.count();
        
        long deleted = countBefore - countAfter;
        log.info("Deleted {} audit logs older than {} days", deleted, retentionDays);
    }
}
