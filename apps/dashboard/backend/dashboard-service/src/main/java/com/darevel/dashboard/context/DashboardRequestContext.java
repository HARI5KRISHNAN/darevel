package com.darevel.dashboard.context;

import org.springframework.util.StringUtils;

import java.util.UUID;

public record DashboardRequestContext(
        UUID userId,
        UUID orgId,
        UUID teamId,
        String userDisplayName,
        String teamName,
        String orgName
) {

    public DashboardRequestContext withTeam(UUID overrideTeamId, String overrideTeamName) {
        UUID resolvedTeamId = overrideTeamId != null ? overrideTeamId : teamId;
        String resolvedTeamName = StringUtils.hasText(overrideTeamName) ? overrideTeamName : teamName;
        return new DashboardRequestContext(userId, orgId, resolvedTeamId, userDisplayName, resolvedTeamName, orgName);
    }

    public DashboardRequestContext withOrgName(String overrideOrgName) {
        if (!StringUtils.hasText(overrideOrgName)) {
            return this;
        }
        return new DashboardRequestContext(userId, orgId, teamId, userDisplayName, teamName, overrideOrgName);
    }
}
