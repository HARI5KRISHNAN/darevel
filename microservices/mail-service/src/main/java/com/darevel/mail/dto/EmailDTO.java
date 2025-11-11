package com.darevel.mail.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDTO {
    private Long id;
    private String fromEmail;
    private String fromName;
    private String toEmail;
    private String toName;
    private String cc;
    private String bcc;
    private String subject;
    private String body;
    private Boolean isRead;
    private Boolean isStarred;
    private Boolean isDraft;
    private Boolean isSent;
    private Boolean isDeleted;
    private String folder;
    private List<String> attachmentUrls;
    private Long replyToId;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}
