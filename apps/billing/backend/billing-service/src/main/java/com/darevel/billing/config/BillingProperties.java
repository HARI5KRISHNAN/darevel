package com.darevel.billing.config;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "billing")
public class BillingProperties {

    private Defaults defaults = new Defaults();
    private Stripe stripe = new Stripe();
    private Webhook webhook = new Webhook();
    private Job job = new Job();

    public Defaults getDefaults() {
        return defaults;
    }

    public void setDefaults(Defaults defaults) {
        this.defaults = defaults;
    }

    public Stripe getStripe() {
        return stripe;
    }

    public void setStripe(Stripe stripe) {
        this.stripe = stripe;
    }

    public Webhook getWebhook() {
        return webhook;
    }

    public void setWebhook(Webhook webhook) {
        this.webhook = webhook;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public static class Defaults {
        private int trialDays = 14;
        private String currency = "USD";
        private String fallbackPlanName = "PRO";
        private Map<String, Boolean> featureToggles = Map.of();

        public int getTrialDays() {
            return trialDays;
        }

        public void setTrialDays(int trialDays) {
            this.trialDays = trialDays;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getFallbackPlanName() {
            return fallbackPlanName;
        }

        public void setFallbackPlanName(String fallbackPlanName) {
            this.fallbackPlanName = fallbackPlanName;
        }

        public Map<String, Boolean> getFeatureToggles() {
            return featureToggles;
        }

        public void setFeatureToggles(Map<String, Boolean> featureToggles) {
            this.featureToggles = featureToggles;
        }
    }

    public static class Stripe {
        private String webhookSecret;
        private String apiKey;
        private String signingSecret;

        public String getWebhookSecret() {
            return webhookSecret;
        }

        public void setWebhookSecret(String webhookSecret) {
            this.webhookSecret = webhookSecret;
        }

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getSigningSecret() {
            return signingSecret;
        }

        public void setSigningSecret(String signingSecret) {
            this.signingSecret = signingSecret;
        }
    }

    public static class Webhook {
        private List<String> allowedEvents = List.of(
                "invoice.paid",
                "invoice.payment_failed",
                "subscription.updated",
                "subscription.deleted");

        public List<String> getAllowedEvents() {
            return allowedEvents;
        }

        public void setAllowedEvents(List<String> allowedEvents) {
            this.allowedEvents = allowedEvents;
        }
    }

    public static class Job {
        private Duration usageAggregationInterval = Duration.ofHours(24);
        private Duration expiryCheckInterval = Duration.ofHours(24);
        private Duration invoiceSyncInterval = Duration.ofHours(24);

        public Duration getUsageAggregationInterval() {
            return usageAggregationInterval;
        }

        public void setUsageAggregationInterval(Duration usageAggregationInterval) {
            this.usageAggregationInterval = usageAggregationInterval;
        }

        public Duration getExpiryCheckInterval() {
            return expiryCheckInterval;
        }

        public void setExpiryCheckInterval(Duration expiryCheckInterval) {
            this.expiryCheckInterval = expiryCheckInterval;
        }

        public Duration getInvoiceSyncInterval() {
            return invoiceSyncInterval;
        }

        public void setInvoiceSyncInterval(Duration invoiceSyncInterval) {
            this.invoiceSyncInterval = invoiceSyncInterval;
        }
    }
}
