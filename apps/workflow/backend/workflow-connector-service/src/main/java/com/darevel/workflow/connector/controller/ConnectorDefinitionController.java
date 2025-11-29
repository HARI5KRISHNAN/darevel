package com.darevel.workflow.connector.controller;

import com.darevel.workflow.connector.entity.ConnectorDefinitionEntity;
import com.darevel.workflow.connector.service.ConnectorDefinitionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/connectors")
@RequiredArgsConstructor
public class ConnectorDefinitionController {

    private final ConnectorDefinitionService service;

    @GetMapping
    public List<ConnectorDefinitionEntity> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public ConnectorDefinitionEntity get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConnectorDefinitionEntity upsert(@Valid @RequestBody ConnectorRequest request) {
        return service.upsert(request.slug(), request.displayName(), request.category(), request.schema());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    public record ConnectorRequest(@NotBlank String slug,
                                   @NotBlank String displayName,
                                   @NotBlank String category,
                                   Map<String, Object> schema) {}
}
