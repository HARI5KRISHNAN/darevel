package com.darevel.wiki.content.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a user mention in a comment
 */
@Entity
@Table(name = "comment_mention")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(CommentMention.CommentMentionId.class)
public class CommentMention {

    @Id
    @Column(name = "comment_id")
    private UUID commentId;

    @Id
    @Column(name = "mentioned_user_id")
    private UUID mentionedUserId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    /**
     * Composite primary key for comment mentions
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentMentionId implements Serializable {
        private UUID commentId;
        private UUID mentionedUserId;
    }
}
