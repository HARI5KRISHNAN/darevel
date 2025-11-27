package com.darevel.dashboard.service;

import com.darevel.dashboard.exception.ResourceNotFoundException;
import com.darevel.dashboard.model.Integration;
import com.darevel.dashboard.repository.IntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final IntegrationRepository integrationRepository;

    @Transactional(readOnly = true)
    public List<Integration> getAllIntegrations(String ownerId) {
        return integrationRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    @Transactional(readOnly = true)
    public Integration getIntegrationById(Long id, String ownerId) {
        return integrationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));
    }

    @Transactional
    public Integration createIntegration(Integration integration) {
        log.info("Creating integration: {} for owner: {}", integration.getName(), integration.getOwnerId());
        return integrationRepository.save(integration);
    }

    @Transactional
    public Integration updateIntegration(Long id, String ownerId, Integration updatedIntegration) {
        Integration integration = integrationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));

        integration.setName(updatedIntegration.getName());
        integration.setType(updatedIntegration.getType());
        integration.setStatus(updatedIntegration.getStatus());
        integration.setConfig(updatedIntegration.getConfig());

        return integrationRepository.save(integration);
    }

    @Transactional
    public void deleteIntegration(Long id, String ownerId) {
        Integration integration = integrationRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Integration", "id", id));

        integrationRepository.delete(integration);
        log.info("Deleted integration: {} by owner: {}", id, ownerId);
    }
}
