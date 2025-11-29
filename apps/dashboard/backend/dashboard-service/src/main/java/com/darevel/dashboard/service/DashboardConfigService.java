package com.darevel.dashboard.service;

import com.darevel.dashboard.repository.DashboardTeamConfigEntity;
import com.darevel.dashboard.repository.DashboardTeamConfigRepository;
import com.darevel.dashboard.repository.DashboardUserConfigEntity;
import com.darevel.dashboard.repository.DashboardUserConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class DashboardConfigService {

    private final DashboardUserConfigRepository userConfigRepository;
    private final DashboardTeamConfigRepository teamConfigRepository;
    private final Clock clock;

    public DashboardConfigService(DashboardUserConfigRepository userConfigRepository,
                                  DashboardTeamConfigRepository teamConfigRepository,
                                  Clock clock) {
        this.userConfigRepository = userConfigRepository;
        this.teamConfigRepository = teamConfigRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public Optional<String> getUserLayout(UUID userId, UUID orgId) {
        return userConfigRepository.findByUserIdAndOrgId(userId, orgId).map(DashboardUserConfigEntity::getLayout);
    }

    @Transactional
    public void saveUserLayout(UUID userId, UUID orgId, String layoutJson) {
        Instant now = Instant.now(clock);
        DashboardUserConfigEntity entity = userConfigRepository.findByUserIdAndOrgId(userId, orgId)
                .orElseGet(() -> newUserConfig(userId, orgId, now));
        entity.setLayout(layoutJson);
        entity.setUpdatedAt(now);
        userConfigRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Optional<String> getTeamLayout(UUID teamId, UUID orgId) {
        return teamConfigRepository.findByTeamIdAndOrgId(teamId, orgId).map(DashboardTeamConfigEntity::getLayout);
    }

    @Transactional
    public void saveTeamLayout(UUID teamId, UUID orgId, String layoutJson) {
        Instant now = Instant.now(clock);
        DashboardTeamConfigEntity entity = teamConfigRepository.findByTeamIdAndOrgId(teamId, orgId)
                .orElseGet(() -> newTeamConfig(teamId, orgId, now));
        entity.setLayout(layoutJson);
        entity.setUpdatedAt(now);
        teamConfigRepository.save(entity);
    }

    private DashboardUserConfigEntity newUserConfig(UUID userId, UUID orgId, Instant timestamp) {
        DashboardUserConfigEntity entity = new DashboardUserConfigEntity();
        entity.setId(UUID.randomUUID());
        entity.setUserId(userId);
        entity.setOrgId(orgId);
        entity.setCreatedAt(timestamp);
        entity.setUpdatedAt(timestamp);
        return entity;
    }

    private DashboardTeamConfigEntity newTeamConfig(UUID teamId, UUID orgId, Instant timestamp) {
        DashboardTeamConfigEntity entity = new DashboardTeamConfigEntity();
        entity.setId(UUID.randomUUID());
        entity.setTeamId(teamId);
        entity.setOrgId(orgId);
        entity.setCreatedAt(timestamp);
        entity.setUpdatedAt(timestamp);
        return entity;
    }
}
