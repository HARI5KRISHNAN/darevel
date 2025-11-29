package com.darevel.workflow.engine.controller;

import com.darevel.workflow.engine.entity.WorkflowRunEntity.RunStatus;
import com.darevel.workflow.engine.service.WorkflowEngineService;
import com.darevel.workflow.shared.events.WorkflowExecutionEvent;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/engine")
@RequiredArgsConstructor
public class WorkflowEngineController {

    private final WorkflowEngineService engineService;

    @PostMapping("/runs")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public UUID enqueueRun(@Valid @RequestBody WorkflowExecutionEvent request) {
        return engineService.startRun(request);
    }

    @PostMapping("/runs/{runId}/status")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void updateStatus(@PathVariable UUID runId, @RequestBody @Valid RunStatusRequest body) {
        engineService.markRun(runId, body.status(), body.logLine());
    }

    public record RunStatusRequest(@NotNull RunStatus status, String logLine) {}
}
