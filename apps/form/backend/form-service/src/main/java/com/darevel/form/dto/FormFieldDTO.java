package com.darevel.form.dto;

import com.darevel.form.domain.FormField.FieldType;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.util.Map;
import java.util.UUID;

@Data
public class FormFieldDTO {
    private UUID id;
    
    @NotNull(message = "Form ID is required")
    private UUID formId;
    
    private UUID sectionId;
    
    @NotBlank(message = "Label is required")
    @Size(max = 500, message = "Label must not exceed 500 characters")
    private String label;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Field type is required")
    private FieldType type;
    
    private Boolean isRequired;
    
    @NotNull(message = "Position is required")
    @Min(value = 0, message = "Position must be non-negative")
    private Integer position;
    
    private Map<String, Object> configJson;
}
