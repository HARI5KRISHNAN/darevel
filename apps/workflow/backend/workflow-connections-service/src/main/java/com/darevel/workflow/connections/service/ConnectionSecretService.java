package com.darevel.workflow.connections.service;

import com.darevel.workflow.connections.entity.ConnectionSecretEntity;
import com.darevel.workflow.connections.repository.ConnectionSecretRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConnectionSecretService {

    private final ConnectionSecretRepository repository;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<ConnectionSecretEntity> list(String tenantId) {
        return tenantId == null ? repository.findAll() : repository.findByTenantId(tenantId);
    }

    public ConnectionSecretEntity get(UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional
    public ConnectionSecretEntity create(String tenantId, String provider, String displayName, Map<String, Object> secret) {
        ConnectionSecretEntity entity = new ConnectionSecretEntity();
        entity.setTenantId(tenantId);
        entity.setProvider(provider);
        entity.setDisplayName(displayName);
        entity.setEncryptedSecret(encrypt(write(secret)));
        entity.setMetadata("{}");
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return repository.save(entity);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private String write(Map<String, Object> secret) {
        try {
            return mapper.writeValueAsString(secret);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid secret payload", e);
        }
    }

    private String encrypt(String plain) {
        // TODO: integrate KMS; Base64 placeholder keeps interface consistent.
        return Base64.getEncoder().encodeToString(plain.getBytes(StandardCharsets.UTF_8));
    }
}
