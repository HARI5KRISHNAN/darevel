package com.darevel.workflow.quota.service;

import com.darevel.workflow.quota.entity.QuotaUsageEntity;
import com.darevel.workflow.quota.repository.QuotaUsageRepository;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuotaService {

    private final QuotaUsageRepository repository;

    public QuotaUsageEntity get(String tenantId) {
        return repository.findByTenantId(tenantId)
                .orElseGet(() -> createDefaultQuota(tenantId));
    }

    @Transactional
    public QuotaUsageEntity increment(String tenantId, long amount) {
        QuotaUsageEntity quota = get(tenantId);
        quota.setMonthlyRuns(quota.getMonthlyRuns() + amount);
        quota.setUpdatedAt(Instant.now());
        return repository.save(quota);
    }

    @Transactional
    public QuotaUsageEntity setLimit(String tenantId, long limit) {
        QuotaUsageEntity quota = get(tenantId);
        quota.setRunLimit(limit);
        quota.setUpdatedAt(Instant.now());
        return repository.save(quota);
    }

    private QuotaUsageEntity createDefaultQuota(String tenantId) {
        QuotaUsageEntity entity = new QuotaUsageEntity();
        entity.setTenantId(tenantId);
        entity.setMonthlyRuns(0L);
        entity.setRunLimit(1000L);
        entity.setResetAt(Instant.now().plusSeconds(30L * 24 * 3600));
        entity.setUpdatedAt(Instant.now());
        return repository.save(entity);
    }
}
