package com.darevel.workflow.quota.controller;

import com.darevel.workflow.quota.entity.QuotaUsageEntity;
import com.darevel.workflow.quota.service.QuotaService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quota")
@RequiredArgsConstructor
public class QuotaController {

    private final QuotaService quotaService;

    @GetMapping
    public QuotaUsageEntity get(@RequestParam String tenantId) {
        return quotaService.get(tenantId);
    }

    @PatchMapping("/increment")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public QuotaUsageEntity increment(@RequestBody IncrementRequest request) {
        return quotaService.increment(request.tenantId(), request.amount());
    }

    @PatchMapping("/limit")
    public QuotaUsageEntity setLimit(@RequestBody LimitRequest request) {
        return quotaService.setLimit(request.tenantId(), request.limit());
    }

    public record IncrementRequest(@NotBlank String tenantId, long amount) {}

    public record LimitRequest(@NotBlank String tenantId, long limit) {}
}
