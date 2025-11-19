package com.darevel.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    private String to;
    private List<String> cc;
    private String subject;
    private String body;
    private String template;
    private Map<String, Object> templateData;
    private boolean html;
}
