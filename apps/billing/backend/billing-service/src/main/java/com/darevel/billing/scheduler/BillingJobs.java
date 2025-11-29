package com.darevel.billing.scheduler;

import com.darevel.billing.model.entity.SubscriptionEntity;
import com.darevel.billing.model.enums.SubscriptionStatus;
import com.darevel.billing.repository.SubscriptionRepository;
import jakarta.transaction.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BillingJobs {

    private static final Logger LOGGER = LoggerFactory.getLogger(BillingJobs.class);

    private final SubscriptionRepository subscriptionRepository;

    @Scheduled(cron = "0 0 1 * * *")
    public void runUsageAggregation() {
        LOGGER.info("Usage aggregation job triggered - integrate upstream metrics here");
        // Placeholder: metrics ingestion handled by other microservices via /usage/report
    }

    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void runSubscriptionExpiryJob() {
        List<SubscriptionEntity> trials = subscriptionRepository.findByStatusInAndTrialEndBefore(
                List.of(SubscriptionStatus.TRIAL), OffsetDateTime.now());
        trials.forEach(subscription -> {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
        });
        LOGGER.info("Subscription expiry job processed {} trials", trials.size());
    }

    @Scheduled(cron = "0 30 0 * * *")
    public void runInvoiceSyncJob() {
        LOGGER.info("Invoice sync job placeholder - rely on provider webhooks for now");
    }
}
