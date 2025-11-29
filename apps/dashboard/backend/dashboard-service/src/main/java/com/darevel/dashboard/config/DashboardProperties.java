package com.darevel.dashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.UUID;

@ConfigurationProperties(prefix = "dashboard")
public record DashboardProperties(Demo demo) {

    public record Demo(
            UUID userId,
            UUID orgId,
            UUID teamId,
            String userName,
            String teamName,
            String orgName
    ) {
    }
}
