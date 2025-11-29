package com.darevel.billing.model.entity;

import com.darevel.billing.model.converter.PlanFeaturesConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "plans")
public class PlanEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_monthly", nullable = false)
    private Integer priceMonthly;

    @Column(name = "price_yearly", nullable = false)
    private Integer priceYearly;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "max_storage_gb")
    private Integer maxStorageGb;

    @Column(columnDefinition = "jsonb")
    @Convert(converter = PlanFeaturesConverter.class)
    private Map<String, Object> features;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPriceMonthly() {
        return priceMonthly;
    }

    public void setPriceMonthly(Integer priceMonthly) {
        this.priceMonthly = priceMonthly;
    }

    public Integer getPriceYearly() {
        return priceYearly;
    }

    public void setPriceYearly(Integer priceYearly) {
        this.priceYearly = priceYearly;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }

    public Integer getMaxStorageGb() {
        return maxStorageGb;
    }

    public void setMaxStorageGb(Integer maxStorageGb) {
        this.maxStorageGb = maxStorageGb;
    }

    public Map<String, Object> getFeatures() {
        return features;
    }

    public void setFeatures(Map<String, Object> features) {
        this.features = features;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
