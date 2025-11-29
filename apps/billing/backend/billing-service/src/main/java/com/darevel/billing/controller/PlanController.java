package com.darevel.billing.controller;

import com.darevel.billing.controller.dto.PlanResponse;
import com.darevel.billing.model.entity.PlanEntity;
import com.darevel.billing.service.PlanService;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/billing/plans", produces = MediaType.APPLICATION_JSON_VALUE)
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public List<PlanResponse> listPlans() {
        return planService.listPlans().stream().map(this::toResponse).toList();
    }

    private PlanResponse toResponse(PlanEntity entity) {
        return new PlanResponse(
                entity.getId(),
                entity.getName(),
                entity.getPriceMonthly(),
                entity.getPriceYearly(),
                entity.getMaxUsers(),
                entity.getMaxStorageGb(),
                entity.getFeatures(),
                entity.getDescription(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
