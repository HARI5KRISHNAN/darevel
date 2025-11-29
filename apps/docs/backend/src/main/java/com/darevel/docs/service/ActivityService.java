package com.darevel.docs.service;

import com.darevel.docs.dto.ActivityResponse;
import com.darevel.docs.entity.Document;
import com.darevel.docs.entity.DocumentActivity;
import com.darevel.docs.repository.DocumentActivityRepository;
import com.darevel.docs.repository.DocumentRepository;
import com.darevel.docs.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final DocumentActivityRepository activityRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public void logActivity(UUID documentId, String userId, String action, Map<String, Object> details) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String userName = SecurityUtil.getCurrentUserName();

        DocumentActivity activity = DocumentActivity.builder()
                .document(document)
                .userId(userId)
                .userName(userName)
                .action(action)
                .details(details)
                .build();

        activityRepository.save(activity);
        log.debug("Activity logged: {} - {} - {}", documentId, userId, action);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities(UUID documentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentActivity> activities = activityRepository
                .findByDocumentIdOrderByCreatedAtDesc(documentId, pageable);

        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivities(UUID documentId, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<DocumentActivity> activities = activityRepository
                .findRecentActivities(documentId, since);

        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ActivityResponse mapToResponse(DocumentActivity activity) {
        return ActivityResponse.builder()
                .id(activity.getId())
                .documentId(activity.getDocument().getId())
                .userId(activity.getUserId())
                .userName(activity.getUserName())
                .action(activity.getAction())
                .details(activity.getDetails())
                .createdAt(activity.getCreatedAt())
                .build();
    }
}
