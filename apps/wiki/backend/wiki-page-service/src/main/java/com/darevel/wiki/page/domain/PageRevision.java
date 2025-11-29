package com.darevel.wiki.page.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "page_revision")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    @Column(nullable = false)
    private long number;

    @Column(nullable = false)
    private UUID authorId;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(name = "summary")
    private String summary;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
