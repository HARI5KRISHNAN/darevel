package com.darevel.dashboard.dto;

public record OrgStatDto(
        String label,
        String value,
        double change,
        String trend
) {
}
