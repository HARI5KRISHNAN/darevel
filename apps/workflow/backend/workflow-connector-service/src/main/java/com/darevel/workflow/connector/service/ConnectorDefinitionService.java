package com.darevel.workflow.connector.service;

import com.darevel.workflow.connector.entity.ConnectorDefinitionEntity;
import com.darevel.workflow.connector.repository.ConnectorDefinitionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConnectorDefinitionService {

    private final ConnectorDefinitionRepository repository;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<ConnectorDefinitionEntity> list() {
        return repository.findAll();
    }

    @Transactional
    public ConnectorDefinitionEntity upsert(String slug, String displayName, String category, Map<String, Object> schema) {
        ConnectorDefinitionEntity entity = repository.findBySlug(slug).orElse(new ConnectorDefinitionEntity());
        entity.setSlug(slug);
        entity.setDisplayName(displayName);
        entity.setCategory(category);
        entity.setSchema(write(schema));
        entity.setEnabled(true);
        entity.setUpdatedAt(Instant.now());
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(Instant.now());
        }
        return repository.save(entity);
    }

    public ConnectorDefinitionEntity get(UUID id) {
        return repository.findById(id).orElseThrow();
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private String write(Map<String, Object> schema) {
        try {
            return mapper.writeValueAsString(schema == null ? Map.of() : schema);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid schema payload", e);
        }
    }

    @PostConstruct
    void seedDefaults() {
        if (repository.count() == 0) {
            upsert("slack", "Slack", "communication", Map.of(
                    "actions", List.of("sendMessage", "createChannel")));
            upsert("gmail", "Gmail", "mail", Map.of(
                    "actions", List.of("sendEmail")));
        }
    }
}
