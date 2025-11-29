package com.darevel.form.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class FormDetailDTO {
    private UUID id;
    private String title;
    private String description;
    private String status;
    private UUID themeId;
    private Boolean isPublic;
    private String publicId;
    private Boolean acceptingResponses;
    private List<FormSectionDTO> sections;
    private List<FormFieldDTO> fields;
    private List<FormLogicRuleDTO> logicRules;
}
