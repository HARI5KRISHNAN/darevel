package com.darevel.form.repository;

import com.darevel.form.domain.FormFieldOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormFieldOptionRepository extends JpaRepository<FormFieldOption, UUID> {
    
    List<FormFieldOption> findByFieldIdOrderByPositionAsc(UUID fieldId);
    
    void deleteByFieldId(UUID fieldId);
}
