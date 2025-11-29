package com.darevel.analytics.service;

import com.darevel.analytics.model.FormAnalytics;
import com.darevel.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public Map<String, Object> getFormAnalytics(String formId) {
        List<FormAnalytics> analytics = analyticsRepository.findByFormId(formId);
        Long totalSubmissions = analyticsRepository.getTotalSubmissionsByFormId(formId);
        
        return Map.of(
                "formId", formId,
                "totalSubmissions", totalSubmissions != null ? totalSubmissions : 0L,
                "submissionsOverTime", analytics.stream()
                        .map(a -> Map.of(
                                "date", a.getSubmissionDate().toString(),
                                "count", a.getTotalSubmissions()
                        ))
                        .collect(Collectors.toList())
        );
    }

    public Map<String, Object> getFormAnalyticsByDateRange(
            String formId, LocalDateTime start, LocalDateTime end) {
        
        List<FormAnalytics> analytics = analyticsRepository
                .findByFormIdAndSubmissionDateBetween(formId, start, end);
        
        Long totalSubmissions = analytics.stream()
                .mapToLong(FormAnalytics::getTotalSubmissions)
                .sum();
        
        return Map.of(
                "formId", formId,
                "dateRange", Map.of("start", start.toString(), "end", end.toString()),
                "totalSubmissions", totalSubmissions,
                "submissionsOverTime", analytics.stream()
                        .map(a -> Map.of(
                                "date", a.getSubmissionDate().toString(),
                                "count", a.getTotalSubmissions()
                        ))
                        .collect(Collectors.toList())
        );
    }
}
