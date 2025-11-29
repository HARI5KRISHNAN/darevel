package com.darevel.form.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "form_theme")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FormTheme {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 20)
    private String primaryColor;

    @Column(length = 20)
    private String accentColor;

    @Column(length = 100)
    private String backgroundStyle;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> configJson;

    @Column(nullable = false)
    private UUID createdBy;

    @Column(nullable = false)
    private Boolean isPublic = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
