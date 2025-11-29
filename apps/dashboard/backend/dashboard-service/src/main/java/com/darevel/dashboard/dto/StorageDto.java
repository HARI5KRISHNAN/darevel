package com.darevel.dashboard.dto;

public record StorageDto(
        double used,
        double total,
        String unit
) {
}
