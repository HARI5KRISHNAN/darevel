package com.darevel.form.dto;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.util.UUID;

@Data
public class FormSectionDTO {
    private UUID id;
    
    @NotNull(message = "Form ID is required")
    private UUID formId;
    
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @NotNull(message = "Position is required")
    @Min(value = 0, message = "Position must be non-negative")
    private Integer position;
}
