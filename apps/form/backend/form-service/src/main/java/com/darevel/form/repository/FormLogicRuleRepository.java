package com.darevel.form.repository;

import com.darevel.form.domain.FormLogicRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FormLogicRuleRepository extends JpaRepository<FormLogicRule, UUID> {
    
    List<FormLogicRule> findByFormId(UUID formId);
    
    List<FormLogicRule> findBySourceFieldId(UUID sourceFieldId);
    
    void deleteByFormId(UUID formId);
}
