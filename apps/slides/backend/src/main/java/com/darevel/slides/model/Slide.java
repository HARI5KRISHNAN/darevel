package com.darevel.slides.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "slides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presentation_id", nullable = false)
    private Presentation presentation;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String layout = "content"; // title, content, choice, poll

    @Column(name = "slide_order", nullable = false)
    private Integer slideOrder = 0;

    // Styling properties
    @Column(name = "background_color")
    private String backgroundColor = "#ffffff";

    @Column(name = "text_color")
    private String textColor = "#000000";

    @Column(name = "title_font_size")
    private Integer titleFontSize;

    @Column(name = "content_font_size")
    private Integer contentFontSize;

    @Column(name = "font_family")
    private String fontFamily;

    @Column(name = "letter_spacing")
    private Double letterSpacing;

    @Column(name = "line_height")
    private Double lineHeight;

    @Column(name = "text_columns")
    private Integer textColumns = 1;

    // Gradient stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> gradient;

    // Image properties stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> image;

    @Column(name = "is_branching")
    private Boolean isBranching = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
