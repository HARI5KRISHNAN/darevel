package com.darevel.mail.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DraftDTO {
    private Long id;

    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("to_recipients")
    private List<String> toRecipients;

    @JsonProperty("cc_recipients")
    private List<String> ccRecipients;

    private String subject;
    private String body;

    @JsonProperty("draft_type")
    private String draftType;

    @JsonProperty("in_reply_to")
    private Long inReplyTo;

    private List<String> attachments;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
