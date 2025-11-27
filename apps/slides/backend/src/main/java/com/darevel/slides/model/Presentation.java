package com.darevel.slides.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "presentations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Presentation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "presentation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("slideOrder ASC")
    private List<Slide> slides = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
