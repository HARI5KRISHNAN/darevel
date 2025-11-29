package com.darevel.wiki.content.domain;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing content change history
 * For audit trail and quick rollback
 */
@Entity
@Table(name = "content_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Type(JsonBinaryType.class)
    @Column(name = "blocks", columnDefinition = "jsonb", nullable = false)
    private List<Block> blocks;

    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Column(name = "change_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ChangeType changeType;

    @Column(name = "change_summary", length = 1000)
    private String changeSummary;

    public enum ChangeType {
        UPDATE,
        BLOCK_ADD,
        BLOCK_DELETE,
        BLOCK_REORDER,
        RESTORE
    }

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = Instant.now();
        }
    }
}
