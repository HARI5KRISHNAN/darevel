package com.darevel.form.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "form_field")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID formId;

    @Column
    private UUID sectionId;

    @Column(nullable = false, length = 500)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType type;

    @Column(nullable = false)
    private Boolean isRequired = false;

    @Column(nullable = false)
    private Integer position;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> configJson;

    public enum FieldType {
        SHORT_TEXT,
        LONG_TEXT,
        NUMBER,
        EMAIL,
        PHONE,
        URL,
        CHOICE_SINGLE,
        CHOICE_MULTI,
        DROPDOWN,
        RATING,
        DATE,
        TIME,
        FILE,
        MATRIX,
        SECTION_BREAK,
        LINEAR_SCALE,
        SLIDER
    }
}
