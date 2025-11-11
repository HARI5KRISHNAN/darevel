package com.darevel.mail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "emails")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Email {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId; // Owner of the email (inbox perspective)

    @Column(name = "from_email", nullable = false)
    private String fromEmail;

    @Column(name = "from_name")
    private String fromName;

    @Column(name = "to_email", nullable = false)
    private String toEmail;

    @Column(name = "to_name")
    private String toName;

    @Column(name = "cc")
    private String cc;

    @Column(name = "bcc")
    private String bcc;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "is_starred", nullable = false)
    @Builder.Default
    private Boolean isStarred = false;

    @Column(name = "is_draft", nullable = false)
    @Builder.Default
    private Boolean isDraft = false;

    @Column(name = "is_sent", nullable = false)
    @Builder.Default
    private Boolean isSent = false;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "folder")
    @Builder.Default
    private String folder = "inbox"; // inbox, sent, drafts, trash

    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls; // JSON array of file URLs

    @Column(name = "reply_to_id")
    private Long replyToId; // Reference to original email if this is a reply

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;
}
