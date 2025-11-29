package com.darevel.analytics.repository;

import com.darevel.analytics.model.FormAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<FormAnalytics, String> {
    
    List<FormAnalytics> findByFormId(String formId);
    
    List<FormAnalytics> findByFormIdAndSubmissionDateBetween(
            String formId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT SUM(fa.totalSubmissions) FROM FormAnalytics fa WHERE fa.formId = ?1")
    Long getTotalSubmissionsByFormId(String formId);
}
