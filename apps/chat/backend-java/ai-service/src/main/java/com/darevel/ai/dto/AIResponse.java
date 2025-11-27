package com.darevel.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {
    private String response;
    private String model;
    private Integer tokensUsed;
    private Long processingTimeMs;
    private boolean success;
    private String error;
}
