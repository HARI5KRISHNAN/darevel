package com.darevel.billing.service;

import com.darevel.billing.config.BillingProperties;
import com.darevel.billing.controller.dto.LimitCheckResponse;
import com.darevel.billing.model.entity.PlanEntity;
import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.model.entity.UsageRecordEntity;
import com.darevel.billing.model.enums.SubscriptionStatus;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LimitService {

    private final SubscriptionService subscriptionService;
    private final UsageService usageService;
    private final BillingProperties properties;

    public LimitCheckResponse check(UUID orgId) {
        SubscriptionEntity subscription = subscriptionService.getSubscription(orgId);
        PlanEntity plan = subscription.getPlan();
        UsageRecordEntity usage = usageService.getLatestUsage(orgId);

        int currentUsers = usage != null && usage.getUsersCount() != null ? usage.getUsersCount() : 0;
        double storageUsed = usage != null && usage.getStorageUsedGb() != null ? usage.getStorageUsedGb() : 0.0;

        Integer maxUsers = plan.getMaxUsers();
        Double maxStorage = plan.getMaxStorageGb() != null ? plan.getMaxStorageGb().doubleValue() : null;

        boolean planActive = subscription.getStatus() == SubscriptionStatus.ACTIVE
            || subscription.getStatus() == SubscriptionStatus.TRIAL;
        boolean canCreateUser = planActive && (maxUsers == null || currentUsers < maxUsers);
        boolean canUploadFile = planActive && (maxStorage == null || storageUsed < maxStorage);

        Map<String, Boolean> features = new HashMap<>(properties.getDefaults().getFeatureToggles());
        if (plan.getFeatures() != null) {
            plan.getFeatures().forEach((key, value) -> {
                boolean enabled;
                if (value instanceof Boolean bool) {
                    enabled = bool;
                } else if (value != null) {
                    enabled = Boolean.parseBoolean(value.toString());
                } else {
                    enabled = false;
                }
                features.put(key, enabled);
            });
        }

        boolean canSendEmail = features.getOrDefault("emails", true);
        boolean canCreateDoc = features.getOrDefault("docs", true);

        String message = planActive
                ? "Plan limits evaluated"
                : "Plan inactive - further actions blocked";

        Integer remainingUsers = maxUsers == null ? null : Math.max(maxUsers - currentUsers, 0);
        Double maxStorageGb = maxStorage;

        return new LimitCheckResponse(
                orgId,
                planActive,
                planActive && canCreateUser,
                planActive && canUploadFile,
                planActive && canSendEmail,
                planActive && canCreateDoc,
                maxUsers,
                currentUsers,
                remainingUsers,
                maxStorageGb,
                storageUsed,
                features,
                message);
    }
}
