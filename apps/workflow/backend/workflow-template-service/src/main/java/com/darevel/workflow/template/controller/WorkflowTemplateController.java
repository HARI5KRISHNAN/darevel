package com.darevel.workflow.template.controller;

import com.darevel.workflow.shared.dto.WorkflowDefinitionDto;
import com.darevel.workflow.template.entity.WorkflowTemplateEntity;
import com.darevel.workflow.template.service.WorkflowTemplateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class WorkflowTemplateController {

    private final WorkflowTemplateService service;

    @GetMapping
    public List<WorkflowTemplateEntity> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public WorkflowTemplateEntity get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkflowTemplateEntity create(@Valid @RequestBody TemplateRequest request) {
        return service.create(request.name(), request.category(), request.summary(), request.definition());
    }

    public record TemplateRequest(@NotBlank String name,
                                  @NotBlank String category,
                                  String summary,
                                  @Valid WorkflowDefinitionDto definition) {}
}
