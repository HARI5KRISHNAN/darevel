package com.darevel.dashboard.controller;

import com.darevel.dashboard.context.DashboardRequestContext;
import com.darevel.dashboard.context.DashboardRequestContextResolver;
import com.darevel.dashboard.controller.model.DashboardConfigRequest;
import com.darevel.dashboard.service.DashboardConfigService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/dashboard/config")
public class DashboardConfigController {

    private final DashboardConfigService configService;
    private final DashboardRequestContextResolver contextResolver;

    public DashboardConfigController(DashboardConfigService configService,
                                     DashboardRequestContextResolver contextResolver) {
        this.configService = configService;
        this.contextResolver = contextResolver;
    }

    @GetMapping("/user")
    public ResponseEntity<String> getUserConfig() {
        DashboardRequestContext context = contextResolver.resolve();
        return configService.getUserLayout(context.userId(), context.orgId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok("{}"));
    }

    @PostMapping("/user")
    public ResponseEntity<Void> saveUserConfig(@Valid @RequestBody DashboardConfigRequest request) {
        DashboardRequestContext context = contextResolver.resolve();
        configService.saveUserLayout(context.userId(), context.orgId(), request.layoutJson());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team/{teamIdentifier}")
    public ResponseEntity<String> getTeamConfig(@PathVariable String teamIdentifier,
                                                @RequestHeader(value = "X-Darevel-Team-Name", required = false) String teamName) {
        DashboardRequestContext context = contextResolver.resolve();
        UUID resolvedTeamId = contextResolver.normalizeIdentifier(teamIdentifier, context.teamId());
        DashboardRequestContext teamContext = context.withTeam(resolvedTeamId, teamName);
        return configService.getTeamLayout(teamContext.teamId(), context.orgId())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok("{}"));
    }

    @PostMapping("/team/{teamIdentifier}")
    public ResponseEntity<Void> saveTeamConfig(@PathVariable String teamIdentifier,
                                               @RequestHeader(value = "X-Darevel-Team-Name", required = false) String teamName,
                                               @Valid @RequestBody DashboardConfigRequest request) {
        DashboardRequestContext context = contextResolver.resolve();
        UUID resolvedTeamId = contextResolver.normalizeIdentifier(teamIdentifier, context.teamId());
        DashboardRequestContext teamContext = context.withTeam(resolvedTeamId, teamName);
        configService.saveTeamLayout(teamContext.teamId(), context.orgId(), request.layoutJson());
        return ResponseEntity.noContent().build();
    }
}
