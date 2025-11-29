package com.darevel.docs.service;

import com.darevel.docs.dto.CollaboratorInfo;
import com.darevel.docs.entity.ActiveSession;
import com.darevel.docs.entity.Document;
import com.darevel.docs.repository.ActiveSessionRepository;
import com.darevel.docs.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
public class SessionService {

    private final ActiveSessionRepository sessionRepository;
    private final DocumentRepository documentRepository;

    @Transactional
    public ActiveSession createSession(UUID documentId, String userId, String userName,
                                       String userEmail, String sessionId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Remove existing session for this user
        sessionRepository.findByDocumentIdAndUserId(documentId, userId)
                .ifPresent(sessionRepository::delete);

        ActiveSession session = ActiveSession.builder()
                .document(document)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .sessionId(sessionId)
                .build();

        session = sessionRepository.save(session);
        log.info("Session created for document: {}, user: {}", documentId, userId);
        return session;
    }

    @Transactional
    public void updateLastSeen(String sessionId) {
        sessionRepository.findBySessionId(sessionId)
                .ifPresent(session -> {
                    session.updateLastSeen();
                    sessionRepository.save(session);
                });
    }

    @Transactional
    public void updateCursorPosition(String sessionId, Map<String, Object> cursorPosition) {
        sessionRepository.findBySessionId(sessionId)
                .ifPresent(session -> {
                    session.setCursorPosition(cursorPosition);
                    session.updateLastSeen();
                    sessionRepository.save(session);
                });
    }

    @Transactional(readOnly = true)
    public List<CollaboratorInfo> getActiveCollaborators(UUID documentId) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        List<ActiveSession> sessions = sessionRepository
                .findActiveSessions(documentId, threshold);

        return sessions.stream()
                .map(this::mapToCollaboratorInfo)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeSession(String sessionId) {
        sessionRepository.deleteBySessionId(sessionId);
        log.info("Session removed: {}", sessionId);
    }

    @Transactional
    public void removeUserSession(UUID documentId, String userId) {
        sessionRepository.deleteByDocumentIdAndUserId(documentId, userId);
        log.info("Session removed for document: {}, user: {}", documentId, userId);
    }

    @Scheduled(fixedDelay = 300000) // Run every 5 minutes
    @Transactional
    public void cleanupStaleSessions() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        sessionRepository.deleteStaleSessions(threshold);
        log.debug("Stale sessions cleaned up");
    }

    private CollaboratorInfo mapToCollaboratorInfo(ActiveSession session) {
        return CollaboratorInfo.builder()
                .userId(session.getUserId())
                .userName(session.getUserName())
                .userEmail(session.getUserEmail())
                .sessionId(session.getSessionId())
                .cursorPosition(session.getCursorPosition())
                .connectedAt(session.getConnectedAt())
                .lastSeenAt(session.getLastSeenAt())
                .isActive(session.isActive())
                .color(generateColor(session.getUserId()))
                .build();
    }

    private String generateColor(String userId) {
        // Generate a consistent color based on userId
        int hash = userId.hashCode();
        String[] colors = {
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
            "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B195", "#C06C84"
        };
        return colors[Math.abs(hash) % colors.length];
    }
}
