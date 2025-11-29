package com.darevel.billing.service;

import com.darevel.billing.config.BillingProperties;
import com.darevel.billing.controller.dto.CancelSubscriptionRequest;
import com.darevel.billing.controller.dto.CreateSubscriptionRequest;
import com.darevel.billing.controller.dto.ReactivateSubscriptionRequest;
import com.darevel.billing.controller.dto.UpdateSubscriptionRequest;
import com.darevel.billing.model.entity.PlanEntity;
import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.model.enums.BillingCycle;
import com.darevel.billing.model.enums.SubscriptionStatus;
import com.darevel.billing.repository.SubscriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanService planService;
    private final BillingProperties properties;

    @Transactional
    public SubscriptionEntity createSubscription(UUID orgId, CreateSubscriptionRequest request) {
        subscriptionRepository
                .findByOrgId(orgId)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Subscription already exists for org");
                });
        PlanEntity plan = planService.getPlan(request.planId());
        SubscriptionEntity entity = new SubscriptionEntity();
        entity.setOrgId(orgId);
        entity.setPlan(plan);
        entity.setBillingCycle(request.billingCycle());
        entity.setExternalCustomerId(request.externalCustomerId());
        entity.setExternalSubscriptionId(request.externalSubscriptionId());
        entity.setCancelAtPeriodEnd(false);

        boolean startTrial = Boolean.TRUE.equals(request.startTrial());
        OffsetDateTime now = OffsetDateTime.now();
        entity.setCurrentPeriodStart(now);
        entity.setCurrentPeriodEnd(calculatePeriodEnd(now, request.billingCycle()));
        entity.setNextBillingDate(entity.getCurrentPeriodEnd());
        if (startTrial) {
            int trialDays = request.trialDays() != null ? request.trialDays() : properties.getDefaults().getTrialDays();
            entity.setStatus(SubscriptionStatus.TRIAL);
            entity.setTrialEnd(now.plusDays(trialDays));
        } else {
            entity.setStatus(SubscriptionStatus.ACTIVE);
        }
        return subscriptionRepository.save(entity);
    }

    public SubscriptionEntity getSubscription(UUID orgId) {
        return subscriptionRepository
                .findByOrgId(orgId)
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found for org"));
    }

    @Transactional
    public SubscriptionEntity updateSubscription(UUID orgId, UpdateSubscriptionRequest request) {
        SubscriptionEntity subscription = getSubscription(orgId);
        PlanEntity plan = planService.getPlan(request.planId());
        subscription.setPlan(plan);
        subscription.setBillingCycle(request.billingCycle());
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCancelAtPeriodEnd(false);
        OffsetDateTime now = OffsetDateTime.now();
        subscription.setCurrentPeriodStart(now);
        subscription.setCurrentPeriodEnd(calculatePeriodEnd(now, request.billingCycle()));
        subscription.setNextBillingDate(subscription.getCurrentPeriodEnd());
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public SubscriptionEntity cancelSubscription(UUID orgId, CancelSubscriptionRequest request) {
        SubscriptionEntity subscription = getSubscription(orgId);
        if (request.cancelImmediately()) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setNextBillingDate(null);
        } else {
            subscription.setCancelAtPeriodEnd(true);
        }
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public SubscriptionEntity reactivate(UUID orgId, ReactivateSubscriptionRequest request) {
        SubscriptionEntity subscription = getSubscription(orgId);
        if (request.planId() != null) {
            subscription.setPlan(planService.getPlan(request.planId()));
        }
        if (request.billingCycle() != null) {
            subscription.setBillingCycle(request.billingCycle());
        }
        subscription.setCancelAtPeriodEnd(false);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        if (subscription.getNextBillingDate() == null) {
            OffsetDateTime now = OffsetDateTime.now();
            subscription.setCurrentPeriodStart(now);
            subscription.setCurrentPeriodEnd(calculatePeriodEnd(now, subscription.getBillingCycle()));
            subscription.setNextBillingDate(subscription.getCurrentPeriodEnd());
        }
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void markInvoicePaid(String externalSubscriptionId) {
        subscriptionRepository
                .findByExternalSubscriptionId(externalSubscriptionId)
                .ifPresent(subscription -> {
                    subscription.setStatus(SubscriptionStatus.ACTIVE);
                    subscription.setCancelAtPeriodEnd(false);
                    subscriptionRepository.save(subscription);
                });
    }

    @Transactional
    public void markInvoiceFailed(String externalSubscriptionId) {
        subscriptionRepository
                .findByExternalSubscriptionId(externalSubscriptionId)
                .ifPresent(subscription -> {
                    subscription.setStatus(SubscriptionStatus.PAST_DUE);
                    subscriptionRepository.save(subscription);
                });
    }

    @Transactional
    public void markCancelled(String externalSubscriptionId) {
        subscriptionRepository
                .findByExternalSubscriptionId(externalSubscriptionId)
                .ifPresent(subscription -> {
                    subscription.setStatus(SubscriptionStatus.CANCELLED);
                    subscription.setCancelAtPeriodEnd(true);
                    subscriptionRepository.save(subscription);
                });
    }

    public List<SubscriptionEntity> findExpiringTrials(OffsetDateTime reference) {
        return subscriptionRepository.findByStatusInAndTrialEndBefore(List.of(SubscriptionStatus.TRIAL), reference);
    }

    private OffsetDateTime calculatePeriodEnd(OffsetDateTime start, BillingCycle cycle) {
        return switch (cycle) {
            case MONTHLY -> start.plus(1, ChronoUnit.MONTHS);
            case YEARLY -> start.plus(1, ChronoUnit.YEARS);
        };
    }
}
