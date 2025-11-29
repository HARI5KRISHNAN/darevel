package com.darevel.docs.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "active_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "session_id", nullable = false, unique = true)
    private String sessionId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cursor_position", columnDefinition = "jsonb")
    private Map<String, Object> cursorPosition;

    @Column(name = "connected_at", nullable = false, updatable = false)
    private LocalDateTime connectedAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @PrePersist
    protected void onCreate() {
        connectedAt = LocalDateTime.now();
        lastSeenAt = LocalDateTime.now();
    }

    public void updateLastSeen() {
        this.lastSeenAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return lastSeenAt.isAfter(LocalDateTime.now().minusMinutes(5));
    }
}
