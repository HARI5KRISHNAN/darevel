package com.darevel.access.service.dto;

import com.darevel.access.model.enums.ResourceType;

public record ResourceRef(String resourceId, ResourceType resourceType) {
    public ResourceRef {
        if (resourceId == null || resourceId.isBlank()) {
            throw new IllegalArgumentException("resourceId is required for resource checks");
        }
        if (resourceType == null) {
            throw new IllegalArgumentException("resourceType is required for resource checks");
        }
    }
}
