package com.darevel.admin.service;

import com.darevel.admin.dto.OrgSettingsRequest;
import com.darevel.admin.dto.OrgSettingsResponse;
import com.darevel.admin.entity.OrgSettingsEntity;
import com.darevel.admin.exception.ResourceNotFoundException;
import com.darevel.admin.repository.OrgSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrgSettingsService {

    private final OrgSettingsRepository repository;

    public OrgSettingsService(OrgSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public OrgSettingsResponse getSettings(UUID orgId) {
        OrgSettingsEntity entity = repository.findByOrgId(orgId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization settings not configured"));
        return map(entity);
    }

    @Transactional
    public OrgSettingsResponse upsertSettings(UUID orgId, OrgSettingsRequest request) {
        OrgSettingsEntity entity = repository.findByOrgId(orgId).orElseGet(OrgSettingsEntity::new);
        entity.setOrgId(orgId);
        entity.setOrgName(request.orgName());
        entity.setTimezone(request.timezone());
        entity.setDefaultLanguage(request.defaultLanguage());
        OrgSettingsEntity saved = repository.save(entity);
        return map(saved);
    }

    private OrgSettingsResponse map(OrgSettingsEntity entity) {
        return new OrgSettingsResponse(entity.getOrgId(), entity.getOrgName(), entity.getTimezone(), entity.getDefaultLanguage(), entity.getUpdatedAt());
    }
}
