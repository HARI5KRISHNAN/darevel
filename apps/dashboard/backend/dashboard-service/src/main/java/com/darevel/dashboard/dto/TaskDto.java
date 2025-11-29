package com.darevel.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TaskDto(
        String id,
        String title,
        String status,
        String priority,
        String dueDate,
        UserSummaryDto assignee
) {
}
