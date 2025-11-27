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
public class MailDTO {
    private Long id;

    @JsonProperty("message_id")
    private String messageId;

    @JsonProperty("from_address")
    private String fromAddress;

    @JsonProperty("to_addresses")
    private List<String> toAddresses;

    private String subject;

    @JsonProperty("body_text")
    private String bodyText;

    @JsonProperty("body_html")
    private String bodyHtml;

    private String folder;
    private String owner;

    @JsonProperty("is_starred")
    private Boolean isStarred;

    @JsonProperty("is_read")
    private Boolean isRead;

    @JsonProperty("is_spam")
    private Boolean isSpam;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
