package com.darevel.billing.service;

import com.darevel.billing.controller.dto.UsageReportRequest;
import com.darevel.billing.model.entity.UsageRecordEntity;
import com.darevel.billing.repository.UsageRecordRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsageService {

    private final UsageRecordRepository usageRecordRepository;

    @Transactional
    public UsageRecordEntity recordUsage(UsageReportRequest request) {
        UsageRecordEntity entity = new UsageRecordEntity();
        entity.setOrgId(request.orgId());
        entity.setUsersCount(request.usersCount());
        entity.setStorageUsedGb(request.storageUsedGb());
        entity.setDocsCount(request.docsCount());
        entity.setFilesCount(request.filesCount());
        entity.setEmailsSent(request.emailsSent());
        entity.setRecordedAt(request.recordedAt() != null ? request.recordedAt() : LocalDate.now());
        return usageRecordRepository.save(entity);
    }

    public List<UsageRecordEntity> getUsage(UUID orgId) {
        return usageRecordRepository.findByOrgIdOrderByRecordedAtDesc(orgId);
    }

    public UsageRecordEntity getLatestUsage(UUID orgId) {
        return usageRecordRepository.findFirstByOrgIdOrderByRecordedAtDesc(orgId).orElse(null);
    }
}
