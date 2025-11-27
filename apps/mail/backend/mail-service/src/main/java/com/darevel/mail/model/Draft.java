package com.darevel.mail.model;

import com.darevel.mail.config.StringArrayConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "drafts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Draft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "to_recipients")
    @Convert(converter = StringArrayConverter.class)
    private String[] toRecipients;

    @Column(name = "cc_recipients")
    @Convert(converter = StringArrayConverter.class)
    private String[] ccRecipients;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "draft_type", length = 50)
    private String draftType = "compose";

    @Column(name = "in_reply_to")
    private Long inReplyTo;

    @Column(name = "attachments")
    @Convert(converter = StringArrayConverter.class)
    private String[] attachments;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
