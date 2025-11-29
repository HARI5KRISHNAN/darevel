package com.darevel.form.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "form_field_option")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormFieldOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID fieldId;

    @Column(nullable = false, length = 500)
    private String label;

    @Column(length = 500)
    private String value;

    @Column(nullable = false)
    private Integer position;

    @Column
    private Boolean isOtherOption = false;
}
