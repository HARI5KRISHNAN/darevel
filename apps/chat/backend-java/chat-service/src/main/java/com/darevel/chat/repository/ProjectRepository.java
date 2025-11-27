package com.darevel.chat.repository;

import com.darevel.chat.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByMemberIdsContaining(Long userId);
    
    List<Project> findAllByOrderByCreatedAtDesc();
}
