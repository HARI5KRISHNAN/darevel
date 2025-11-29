package com.darevel.dashboard.controller;

import com.darevel.dashboard.context.DashboardRequestContext;
import com.darevel.dashboard.context.DashboardRequestContextResolver;
import com.darevel.dashboard.dto.OrgDashboardResponse;
import com.darevel.dashboard.dto.PersonalDashboardResponse;
import com.darevel.dashboard.dto.TeamDashboardResponse;
import com.darevel.dashboard.service.DashboardAggregationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardAggregationService aggregationService;
    private final DashboardRequestContextResolver contextResolver;

    public DashboardController(DashboardAggregationService aggregationService,
                               DashboardRequestContextResolver contextResolver) {
        this.aggregationService = aggregationService;
        this.contextResolver = contextResolver;
    }

    @GetMapping("/user")
    public ResponseEntity<PersonalDashboardResponse> getUserDashboard() {
        DashboardRequestContext context = contextResolver.resolve();
        return ResponseEntity.ok(aggregationService.getPersonalDashboard(context));
    }

    @GetMapping("/team/{teamIdentifier}")
    public ResponseEntity<TeamDashboardResponse> getTeamDashboard(@PathVariable String teamIdentifier,
                                                                  @RequestHeader(value = "X-Darevel-Team-Name", required = false) String teamName) {
        DashboardRequestContext context = contextResolver.resolve();
        UUID resolvedTeamId = contextResolver.normalizeIdentifier(teamIdentifier, context.teamId());
        DashboardRequestContext teamContext = context.withTeam(resolvedTeamId, teamName);
        return ResponseEntity.ok(aggregationService.getTeamDashboard(teamContext));
    }

    @GetMapping("/org")
    public ResponseEntity<OrgDashboardResponse> getOrgDashboard(@RequestHeader(value = "X-Darevel-Org-Name", required = false) String orgName) {
        DashboardRequestContext context = contextResolver.resolve().withOrgName(orgName);
        return ResponseEntity.ok(aggregationService.getOrgDashboard(context));
    }
}
