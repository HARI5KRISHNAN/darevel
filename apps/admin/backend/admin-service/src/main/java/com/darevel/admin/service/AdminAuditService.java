package com.darevel.admin.service;

import com.darevel.admin.entity.AdminAuditLogEntity;
import com.darevel.admin.integration.AuditClient;
import com.darevel.admin.repository.AdminAuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class AdminAuditService {

    private final AdminAuditLogRepository repository;
    private final AuditClient auditClient;

    public AdminAuditService(AdminAuditLogRepository repository, AuditClient auditClient) {
        this.repository = repository;
        this.auditClient = auditClient;
    }

    public void recordAction(UUID orgId, UUID adminUserId, String action, String targetType, UUID targetId, Map<String, Object> metadata) {
        AdminAuditLogEntity entity = new AdminAuditLogEntity();
        entity.setOrgId(orgId);
        entity.setAdminUserId(adminUserId);
        entity.setAction(action);
        entity.setTargetType(targetType);
        entity.setTargetId(targetId);
        entity.setMetadata(metadata);
        repository.save(entity);

        auditClient.publishAdminEvent(new AuditClient.AdminAuditPayload(orgId, adminUserId, action, targetType, targetId, entity.getCreatedAt()));
    }
}
