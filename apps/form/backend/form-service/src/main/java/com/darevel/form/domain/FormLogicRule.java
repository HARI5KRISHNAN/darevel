package com.darevel.form.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "form_logic_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormLogicRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID formId;

    @Column(nullable = false)
    private UUID sourceFieldId;

    @Column(nullable = false, length = 50)
    private String conditionType; // EQUALS, CONTAINS, GREATER_THAN, LESS_THAN, etc.

    @Column(length = 500)
    private String conditionValue;

    @Column(nullable = false, length = 50)
    private String targetAction; // SHOW_FIELD, HIDE_FIELD, GO_TO_SECTION, END_FORM

    @Column
    private UUID targetReferenceId; // field_id or section_id depending on action
}
