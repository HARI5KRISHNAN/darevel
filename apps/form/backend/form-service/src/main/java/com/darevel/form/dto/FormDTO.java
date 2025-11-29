package com.darevel.form.dto;

import com.darevel.form.domain.Form.FormStatus;
import lombok.Data;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

@Data
public class FormDTO {
    private UUID id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    private FormStatus status;
    private UUID themeId;
    private Boolean isPublic;
    private String publicId;
    private Boolean acceptingResponses;
    private Instant opensAt;
    private Instant closesAt;
    private Integer maxResponses;
    private Integer currentResponseCount;
    private Boolean allowMultipleSubmissions;
    private Boolean requireAuthentication;
    private Boolean shuffleQuestions;
    private Boolean showProgressBar;
    private String confirmationMessage;
    private String redirectUrl;
    private UUID ownerId;
    private Instant createdAt;
    private Instant updatedAt;
}
