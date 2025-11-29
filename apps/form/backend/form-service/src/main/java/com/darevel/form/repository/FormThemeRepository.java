package com.darevel.form.repository;

import com.darevel.form.domain.FormTheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormThemeRepository extends JpaRepository<FormTheme, UUID> {
    
    List<FormTheme> findByCreatedBy(UUID userId);
    
    List<FormTheme> findByIsPublicTrue();
}
