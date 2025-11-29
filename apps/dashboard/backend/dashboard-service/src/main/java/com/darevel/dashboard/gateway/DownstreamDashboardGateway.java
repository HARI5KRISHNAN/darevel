package com.darevel.dashboard.gateway;

import com.darevel.dashboard.context.DashboardRequestContext;
import com.darevel.dashboard.dto.OrgDashboardResponse;
import com.darevel.dashboard.dto.PersonalDashboardResponse;
import com.darevel.dashboard.dto.TeamDashboardResponse;

public interface DownstreamDashboardGateway {

    PersonalDashboardResponse fetchPersonalSummary(DashboardRequestContext context);

    TeamDashboardResponse fetchTeamSummary(DashboardRequestContext context);

    OrgDashboardResponse fetchOrgSummary(DashboardRequestContext context);
}
