package com.darevel.form.repository;

import com.darevel.form.domain.FormField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormFieldRepository extends JpaRepository<FormField, UUID> {
    
    List<FormField> findByFormIdOrderByPositionAsc(UUID formId);
    
    List<FormField> findBySectionIdOrderByPositionAsc(UUID sectionId);
    
    void deleteByFormId(UUID formId);
}
