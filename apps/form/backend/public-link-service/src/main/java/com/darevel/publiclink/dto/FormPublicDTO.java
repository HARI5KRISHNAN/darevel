package com.darevel.publiclink.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class FormPublicDTO {
    private String id;
    private String title;
    private String description;
    private Boolean isPublic;
    private Boolean acceptingResponses;
    private List<FormFieldPublicDTO> fields;
}

@Data
class FormFieldPublicDTO {
    private String id;
    private String label;
    private String description;
    private String type;
    private Boolean isRequired;
    private Map<String, Object> configJson;
}
