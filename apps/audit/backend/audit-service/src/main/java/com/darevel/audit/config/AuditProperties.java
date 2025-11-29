package com.darevel.audit.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "audit")
@Data
public class AuditProperties {

    private Retention retention = new Retention();
    private Export export = new Export();

    @Data
    public static class Retention {
        private boolean enabled = true;
        private int days = 90;
    }

    @Data
    public static class Export {
        private boolean enabled = true;
        private String schedule = "0 0 2 * * *";
        private String path = "/var/audit/exports";
    }
}
