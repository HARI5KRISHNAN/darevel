package com.darevel.publiclink.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

@Data
public class SubmissionDTO {
    private String submitterId;
    
    @NotNull(message = "Answers are required")
    private List<AnswerDTO> answers;
}

@Data
class AnswerDTO {
    @NotNull
    private String fieldId;
    
    private String valueText;
    private Double valueNumber;
    private String valueDate;
    private Map<String, Object> valueJson;
}
