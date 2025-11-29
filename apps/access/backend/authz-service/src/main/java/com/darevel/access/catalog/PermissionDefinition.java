package com.darevel.access.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PermissionDefinition(
        String code,
        String name,
        String description,
        String module) {
}
