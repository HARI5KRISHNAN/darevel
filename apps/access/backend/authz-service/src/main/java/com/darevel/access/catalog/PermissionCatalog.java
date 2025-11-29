package com.darevel.access.catalog;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class PermissionCatalog {

    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    private List<PermissionDefinition> definitions = List.of();

    public PermissionCatalog(ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void loadCatalog() {
        Resource resource = resourceLoader.getResource("classpath:permissions-catalog.json");
        try {
            this.definitions = objectMapper.readValue(
                    resource.getInputStream(), new TypeReference<List<PermissionDefinition>>() {});
            log.info("Loaded {} permission definitions", definitions.size());
        } catch (IOException e) {
            log.error("Unable to load permission catalog", e);
            this.definitions = Collections.emptyList();
        }
    }

    public List<PermissionDefinition> getDefinitions() {
        return definitions;
    }
}
