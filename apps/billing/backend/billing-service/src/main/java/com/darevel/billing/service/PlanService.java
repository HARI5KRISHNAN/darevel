package com.darevel.billing.service;

import com.darevel.billing.config.BillingProperties;
import com.darevel.billing.model.entity.PlanEntity;
import com.darevel.billing.repository.PlanRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;
    private final BillingProperties properties;

    public List<PlanEntity> listPlans() {
        return planRepository.findAll();
    }

    public PlanEntity getPlan(UUID planId) {
        return planRepository
                .findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("Plan not found"));
    }

    public PlanEntity resolvePlan(UUID planId) {
        if (planId != null) {
            return getPlan(planId);
        }
        return planRepository
                .findByNameIgnoreCase(properties.getDefaults().getFallbackPlanName())
                .orElseThrow(() -> new EntityNotFoundException("Default plan is not configured"));
    }
}
