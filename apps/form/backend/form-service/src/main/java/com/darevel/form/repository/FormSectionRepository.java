package com.darevel.form.repository;

import com.darevel.form.domain.FormSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormSectionRepository extends JpaRepository<FormSection, UUID> {
    
    List<FormSection> findByFormIdOrderByPositionAsc(UUID formId);
    
    void deleteByFormId(UUID formId);
}
