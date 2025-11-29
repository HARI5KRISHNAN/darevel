package com.darevel.docs.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDocumentRequest {

    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    private Map<String, Object> content;

    private Boolean isTemplate;
}
