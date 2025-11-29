package com.darevel.workflow.designer.entity;

import com.darevel.workflow.shared.enums.WorkflowStatus;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "workflow_definitions")
@Getter
@Setter
public class WorkflowDefinitionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private WorkflowStatus status;

    @Column(name = "trigger_type")
    private String triggerType;

    @Column(name = "trigger_config", columnDefinition = "jsonb")
    private String triggerConfig;

    @Column(name = "actions", columnDefinition = "jsonb")
    private String actions;

    private Integer version;

    @Column(name = "owner_id")
    private String ownerId;

    @Column(name = "organization_id")
    private String organizationId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata;
}
