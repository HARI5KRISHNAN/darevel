package com.darevel.mail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComposeEmailRequest {
    private String toEmail;
    private String toName;
    private String cc;
    private String bcc;
    private String subject;
    private String body;
    private Boolean isDraft; // true = save as draft, false = send immediately
    private List<String> attachmentUrls; // URLs to files in Drive Service
    private Long replyToId; // If this is a reply to another email
}
