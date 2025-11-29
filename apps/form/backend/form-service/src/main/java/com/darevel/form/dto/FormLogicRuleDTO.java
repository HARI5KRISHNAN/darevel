package com.darevel.form.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.util.UUID;

@Data
public class FormLogicRuleDTO {
    private UUID id;
    
    @NotNull(message = "Form ID is required")
    private UUID formId;
    
    @NotNull(message = "Source field ID is required")
    private UUID sourceFieldId;
    
    @NotBlank(message = "Condition type is required")
    private String conditionType;
    
    private String conditionValue;
    
    @NotBlank(message = "Target action is required")
    private String targetAction;
    
    private UUID targetReferenceId;
}
