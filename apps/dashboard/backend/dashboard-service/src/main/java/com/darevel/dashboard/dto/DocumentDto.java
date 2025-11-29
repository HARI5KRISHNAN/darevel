package com.darevel.dashboard.dto;

public record DocumentDto(
        String id,
        String title,
        String type,
        String lastModified,
        String author
) {
}
