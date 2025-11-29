package com.darevel.dashboard.controller.model;

import jakarta.validation.constraints.NotBlank;

public record DashboardConfigRequest(@NotBlank String layoutJson) {
}
