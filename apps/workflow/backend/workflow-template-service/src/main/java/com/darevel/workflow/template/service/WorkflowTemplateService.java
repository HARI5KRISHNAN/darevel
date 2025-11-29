package com.darevel.workflow.template.service;

import com.darevel.workflow.shared.dto.WorkflowDefinitionDto;
import com.darevel.workflow.template.entity.WorkflowTemplateEntity;
import com.darevel.workflow.template.repository.WorkflowTemplateRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkflowTemplateService {

    private final WorkflowTemplateRepository repository;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<WorkflowTemplateEntity> list() {
        return repository.findAll();
    }

    public WorkflowTemplateEntity get(UUID id) {
        return repository.findById(id).orElseThrow();
    }

    @Transactional
    public WorkflowTemplateEntity create(String name, String category, String summary, WorkflowDefinitionDto definition) {
        WorkflowTemplateEntity entity = new WorkflowTemplateEntity();
        entity.setName(name);
        entity.setCategory(category);
        entity.setSummary(summary);
        entity.setDefinition(write(definition));
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());
        return repository.save(entity);
    }

    private String write(WorkflowDefinitionDto definition) {
        try {
            return mapper.writeValueAsString(definition);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid workflow definition", e);
        }
    }
}
