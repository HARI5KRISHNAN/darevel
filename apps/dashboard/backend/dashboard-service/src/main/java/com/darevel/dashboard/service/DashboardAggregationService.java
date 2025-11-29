package com.darevel.dashboard.service;

import com.darevel.dashboard.context.DashboardRequestContext;
import com.darevel.dashboard.dto.OrgDashboardResponse;
import com.darevel.dashboard.dto.PersonalDashboardResponse;
import com.darevel.dashboard.dto.TeamDashboardResponse;
import com.darevel.dashboard.gateway.DownstreamDashboardGateway;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class DashboardAggregationService {

    private final DownstreamDashboardGateway downstreamGateway;

    public DashboardAggregationService(DownstreamDashboardGateway downstreamGateway) {
        this.downstreamGateway = downstreamGateway;
    }

    @Cacheable(cacheNames = "dashboard-user", key = "#context.userId()")
    public PersonalDashboardResponse getPersonalDashboard(DashboardRequestContext context) {
        return downstreamGateway.fetchPersonalSummary(context);
    }

    @Cacheable(cacheNames = "dashboard-team", key = "#context.teamId()")
    public TeamDashboardResponse getTeamDashboard(DashboardRequestContext context) {
        return downstreamGateway.fetchTeamSummary(context);
    }

    @Cacheable(cacheNames = "dashboard-org", key = "#context.orgId()")
    public OrgDashboardResponse getOrgDashboard(DashboardRequestContext context) {
        return downstreamGateway.fetchOrgSummary(context);
    }
}
