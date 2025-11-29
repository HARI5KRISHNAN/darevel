package com.darevel.aiform.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class FormGenerationRequest {
    
    @NotBlank(message = "Prompt is required")
    private String prompt;
    
    private String formType; // survey, feedback, registration, etc.
    private Integer maxFields = 10;
}
