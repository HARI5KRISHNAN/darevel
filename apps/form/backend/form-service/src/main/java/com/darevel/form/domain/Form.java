package com.darevel.form.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "form")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Form {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormStatus status = FormStatus.DRAFT;

    private UUID themeId;

    @Column(nullable = false)
    private Boolean isPublic = false;

    @Column(unique = true, length = 50)
    private String publicId;

    @Column(nullable = false)
    private Boolean acceptingResponses = true;

    @Column
    private Instant opensAt;

    @Column
    private Instant closesAt;

    @Column
    private Integer maxResponses;

    @Column
    private Integer currentResponseCount = 0;

    @Column(nullable = false)
    private Boolean allowMultipleSubmissions = false;

    @Column(nullable = false)
    private Boolean requireAuthentication = false;

    @Column(nullable = false)
    private Boolean shuffleQuestions = false;

    @Column(nullable = false)
    private Boolean showProgressBar = true;

    @Column(columnDefinition = "TEXT")
    private String confirmationMessage;

    @Column(length = 500)
    private String redirectUrl;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    public enum FormStatus {
        DRAFT,
        ACTIVE,
        CLOSED,
        ARCHIVED
    }
}
