package com.darevel.aiform.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class FormGenerationResponse {
    private String title;
    private String description;
    private List<GeneratedField> fields;
}

@Data
class GeneratedField {
    private String label;
    private String type; // text, email, number, select, etc.
    private String description;
    private Boolean required;
    private Map<String, Object> config;
}
