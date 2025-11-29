package com.darevel.workflow.designer.service;

import com.darevel.workflow.designer.entity.WorkflowDefinitionEntity;
import com.darevel.workflow.designer.repository.WorkflowDefinitionRepository;
import com.darevel.workflow.shared.dto.WorkflowDefinitionDto;
import com.darevel.workflow.shared.dto.WorkflowTriggerDto;
import com.darevel.workflow.shared.enums.WorkflowStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowDefinitionService {

    private final WorkflowDefinitionRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<WorkflowDefinitionDto> list(String status) {
        List<WorkflowDefinitionEntity> entities = status == null
                ? repository.findAll()
                : repository.findByStatus(WorkflowStatus.valueOf(status));
        return entities.stream().map(this::toDto).toList();
    }

    public WorkflowDefinitionDto get(UUID id) {
        return repository.findById(id).map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Workflow definition not found"));
    }

    @Transactional
    public WorkflowDefinitionDto save(WorkflowDefinitionDto dto) {
        WorkflowDefinitionEntity entity = dto.getId() == null
                ? new WorkflowDefinitionEntity()
                : repository.findById(dto.getId()).orElse(new WorkflowDefinitionEntity());

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        entity.setTriggerType(dto.getTrigger().getType().name());
        entity.setTriggerConfig(writeJson(dto.getTrigger()));
        entity.setActions(writeJson(dto.getActions()));
        entity.setVersion(dto.getVersion());
        entity.setOwnerId(dto.getOwnerId());
        entity.setOrganizationId(dto.getOrganizationId());
        entity.setMetadata("{}");
        entity.setUpdatedAt(Instant.now());
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(Instant.now());
        }

        WorkflowDefinitionEntity saved = repository.save(entity);
        return toDto(saved);
    }

    public void delete(UUID id) {
        repository.deleteById(id);
    }

    private WorkflowDefinitionDto toDto(WorkflowDefinitionEntity entity) {
        return WorkflowDefinitionDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .trigger(readTrigger(entity.getTriggerConfig(), entity.getTriggerType()))
                .actions(readActions(entity.getActions()))
                .version(entity.getVersion())
                .ownerId(entity.getOwnerId())
                .organizationId(entity.getOrganizationId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private WorkflowTriggerDto readTrigger(String json, String type) {
        try {
            WorkflowTriggerDto dto = objectMapper.readValue(json, WorkflowTriggerDto.class);
            if (dto.getType() == null && type != null) {
                return dto.toBuilder().type(com.darevel.workflow.shared.enums.TriggerType.valueOf(type)).build();
            }
            return dto;
        } catch (Exception ex) {
            log.error("Failed to deserialize trigger config", ex);
            return WorkflowTriggerDto.builder().type(com.darevel.workflow.shared.enums.TriggerType.valueOf(type)).build();
        }
    }

    private List<com.darevel.workflow.shared.dto.WorkflowActionDto> readActions(String json) {
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, com.darevel.workflow.shared.dto.WorkflowActionDto.class));
        } catch (Exception ex) {
            log.error("Failed to deserialize workflow actions", ex);
            return List.of();
        }
    }

    private String writeJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Unable to serialize workflow payload", e);
        }
    }
}
