package com.darevel.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "admin")
public class AdminProperties {

    private final Defaults defaults = new Defaults();
    private final Caching caching = new Caching();
    private final Integrations integrations = new Integrations();

    public Defaults getDefaults() {
        return defaults;
    }

    public Caching getCaching() {
        return caching;
    }

    public Integrations getIntegrations() {
        return integrations;
    }

    public static class Defaults {
        private String billingPlan = "Enterprise";
        private String billingStatus = "Active";
        private int seatsTotal = 50;

        public String getBillingPlan() {
            return billingPlan;
        }

        public void setBillingPlan(String billingPlan) {
            this.billingPlan = billingPlan;
        }

        public String getBillingStatus() {
            return billingStatus;
        }

        public void setBillingStatus(String billingStatus) {
            this.billingStatus = billingStatus;
        }

        public int getSeatsTotal() {
            return seatsTotal;
        }

        public void setSeatsTotal(int seatsTotal) {
            this.seatsTotal = seatsTotal;
        }
    }

    public static class Caching {
        private long ttlSeconds = 60;

        public long getTtlSeconds() {
            return ttlSeconds;
        }

        public void setTtlSeconds(long ttlSeconds) {
            this.ttlSeconds = ttlSeconds;
        }
    }

    public static class Integrations {
        private String billingBaseUrl = "http://localhost:8082";
        private String auditBaseUrl = "http://localhost:8084";
        private String usageBaseUrl = "http://localhost:8086";
        private String identityBaseUrl = "http://localhost:8080";
        private String driveBaseUrl = "http://localhost:8088";
        private String docsBaseUrl = "http://localhost:8090";

        public String getBillingBaseUrl() {
            return billingBaseUrl;
        }

        public void setBillingBaseUrl(String billingBaseUrl) {
            this.billingBaseUrl = billingBaseUrl;
        }

        public String getAuditBaseUrl() {
            return auditBaseUrl;
        }

        public void setAuditBaseUrl(String auditBaseUrl) {
            this.auditBaseUrl = auditBaseUrl;
        }

        public String getUsageBaseUrl() {
            return usageBaseUrl;
        }

        public void setUsageBaseUrl(String usageBaseUrl) {
            this.usageBaseUrl = usageBaseUrl;
        }

        public String getIdentityBaseUrl() {
            return identityBaseUrl;
        }

        public void setIdentityBaseUrl(String identityBaseUrl) {
            this.identityBaseUrl = identityBaseUrl;
        }

        public String getDriveBaseUrl() {
            return driveBaseUrl;
        }

        public void setDriveBaseUrl(String driveBaseUrl) {
            this.driveBaseUrl = driveBaseUrl;
        }

        public String getDocsBaseUrl() {
            return docsBaseUrl;
        }

        public void setDocsBaseUrl(String docsBaseUrl) {
            this.docsBaseUrl = docsBaseUrl;
        }
    }
}
