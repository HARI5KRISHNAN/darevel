package com.darevel.search.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "search_audit")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchAuditEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String query;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String workspaceId;

    @Column(nullable = false)
    private long totalHits;

    @Column(nullable = false)
    private Instant executedAt;

    @Column(nullable = false)
    private long tookMs;
}
