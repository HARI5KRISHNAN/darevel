package com.darevel.dashboard.dto;

public record ActivitySeriesDto(
        String name,
        int users,
        int docs,
        int tasks
) {
}
