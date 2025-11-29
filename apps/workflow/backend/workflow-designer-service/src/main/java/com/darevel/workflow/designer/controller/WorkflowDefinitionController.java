package com.darevel.workflow.designer.controller;

import com.darevel.workflow.designer.service.WorkflowDefinitionService;
import com.darevel.workflow.shared.dto.WorkflowDefinitionDto;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowDefinitionController {

    private final WorkflowDefinitionService service;

    @GetMapping
    public List<WorkflowDefinitionDto> list(@RequestParam(required = false) String status) {
        return service.list(status);
    }

    @GetMapping("/{id}")
    public WorkflowDefinitionDto get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkflowDefinitionDto create(@RequestBody @Valid WorkflowDefinitionDto dto) {
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public WorkflowDefinitionDto update(@PathVariable UUID id, @RequestBody @Valid WorkflowDefinitionDto dto) {
        return service.save(dto.toBuilder().id(id).build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
