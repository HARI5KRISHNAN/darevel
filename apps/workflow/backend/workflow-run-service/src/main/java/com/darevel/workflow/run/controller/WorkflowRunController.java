package com.darevel.workflow.run.controller;

import com.darevel.workflow.run.service.WorkflowRunQueryService;
import com.darevel.workflow.shared.dto.WorkflowRunDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/runs")
@RequiredArgsConstructor
public class WorkflowRunController {

    private final WorkflowRunQueryService service;

    @GetMapping
    public Page<WorkflowRunDto> list(@RequestParam(required = false) UUID workflowId,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return service.list(workflowId, page, size);
    }
}
