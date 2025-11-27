package com.darevel.mail.model;

import com.darevel.mail.config.StringArrayConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "mails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id")
    private String messageId;

    @Column(name = "from_address")
    private String fromAddress;

    @Column(name = "to_addresses", columnDefinition = "TEXT")
    @Convert(converter = StringArrayConverter.class)
    private String[] toAddresses;

    private String subject;

    @Column(name = "body_text", columnDefinition = "TEXT")
    private String bodyText;

    @Column(name = "body_html", columnDefinition = "TEXT")
    private String bodyHtml;

    @Column(length = 50)
    private String folder = "INBOX";

    private String owner;

    @Column(name = "is_starred")
    private Boolean isStarred = false;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_spam")
    private Boolean isSpam = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
