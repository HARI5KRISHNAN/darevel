package com.darevel.admin.service;

import com.darevel.admin.dto.ActivityLogEntry;
import com.darevel.admin.integration.AuditClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ActivityFeedService {

    private final AuditClient auditClient;

    public ActivityFeedService(AuditClient auditClient) {
        this.auditClient = auditClient;
    }

    public List<ActivityLogEntry> fetchRecent(UUID orgId, int limit) {
        return auditClient.fetchRecentActivity(orgId, limit);
    }
}
