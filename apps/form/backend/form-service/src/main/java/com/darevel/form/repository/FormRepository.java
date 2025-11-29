package com.darevel.form.repository;

import com.darevel.form.domain.Form;
import com.darevel.form.domain.Form.FormStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FormRepository extends JpaRepository<Form, UUID> {
    
    Page<Form> findByOwnerId(UUID ownerId, Pageable pageable);
    
    Page<Form> findByOwnerIdAndStatus(UUID ownerId, FormStatus status, Pageable pageable);
    
    Optional<Form> findByPublicId(String publicId);
    
    boolean existsByPublicId(String publicId);
}
