package com.darevel.docs.websocket;

import com.darevel.docs.dto.UserInfo;
import com.darevel.docs.dto.websocket.DocumentUpdateMessage;
import com.darevel.docs.service.SessionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentWebSocketHandler extends TextWebSocketHandler {

    private final SessionService sessionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Map: documentId -> Set of WebSocket sessions
    private final Map<UUID, CopyOnWriteArraySet<WebSocketSession>> documentSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UUID documentId = extractDocumentId(session);
        String userId = extractUserId(session);
        String userName = extractUserName(session);
        String userEmail = extractUserEmail(session);

        if (documentId == null || userId == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        // Add session to document sessions
        documentSessions.computeIfAbsent(documentId, k -> new CopyOnWriteArraySet<>()).add(session);

        // Create active session in database
        sessionService.createSession(documentId, userId, userName, userEmail, session.getId());

        // Notify other collaborators
        broadcastToDocument(documentId, DocumentUpdateMessage.builder()
                .type("user_joined")
                .userId(userId)
                .userName(userName)
                .sessionId(session.getId())
                .timestamp(System.currentTimeMillis())
                .build(), session);

        log.info("WebSocket connection established: document={}, user={}, session={}",
                documentId, userId, session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        UUID documentId = extractDocumentId(session);
        String userId = extractUserId(session);

        if (documentId == null || userId == null) {
            return;
        }

        try {
            // Parse message
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);

            String messageType = (String) payload.get("type");

            // Handle different message types
            switch (messageType) {
                case "update":
                    // Document content update
                    handleDocumentUpdate(documentId, userId, payload, session);
                    break;
                case "cursor":
                    // Cursor position update
                    handleCursorUpdate(documentId, userId, payload, session);
                    break;
                case "selection":
                    // Selection update
                    handleSelectionUpdate(documentId, userId, payload, session);
                    break;
                case "awareness":
                    // Awareness state (Yjs)
                    handleAwarenessUpdate(documentId, userId, payload, session);
                    break;
                default:
                    log.warn("Unknown message type: {}", messageType);
            }

            // Update last seen
            sessionService.updateLastSeen(session.getId());

        } catch (Exception e) {
            log.error("Error handling WebSocket message", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        UUID documentId = extractDocumentId(session);
        String userId = extractUserId(session);
        String userName = extractUserName(session);

        if (documentId != null) {
            // Remove session from document sessions
            CopyOnWriteArraySet<WebSocketSession> sessions = documentSessions.get(documentId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    documentSessions.remove(documentId);
                }
            }

            // Remove active session from database
            sessionService.removeSession(session.getId());

            // Notify other collaborators
            broadcastToDocument(documentId, DocumentUpdateMessage.builder()
                    .type("user_left")
                    .userId(userId)
                    .userName(userName)
                    .sessionId(session.getId())
                    .timestamp(System.currentTimeMillis())
                    .build(), null);

            log.info("WebSocket connection closed: document={}, user={}, session={}, status={}",
                    documentId, userId, session.getId(), status);
        }
    }

    private void handleDocumentUpdate(UUID documentId, String userId, Map<String, Object> payload,
                                      WebSocketSession excludeSession) {
        DocumentUpdateMessage message = DocumentUpdateMessage.builder()
                .type("update")
                .userId(userId)
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();

        broadcastToDocument(documentId, message, excludeSession);
    }

    private void handleCursorUpdate(UUID documentId, String userId, Map<String, Object> payload,
                                    WebSocketSession excludeSession) {
        @SuppressWarnings("unchecked")
        Map<String, Object> cursorPosition = (Map<String, Object>) payload.get("position");
        sessionService.updateCursorPosition(excludeSession.getId(), cursorPosition);

        DocumentUpdateMessage message = DocumentUpdateMessage.builder()
                .type("cursor")
                .userId(userId)
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();

        broadcastToDocument(documentId, message, excludeSession);
    }

    private void handleSelectionUpdate(UUID documentId, String userId, Map<String, Object> payload,
                                       WebSocketSession excludeSession) {
        DocumentUpdateMessage message = DocumentUpdateMessage.builder()
                .type("selection")
                .userId(userId)
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();

        broadcastToDocument(documentId, message, excludeSession);
    }

    private void handleAwarenessUpdate(UUID documentId, String userId, Map<String, Object> payload,
                                       WebSocketSession excludeSession) {
        DocumentUpdateMessage message = DocumentUpdateMessage.builder()
                .type("awareness")
                .userId(userId)
                .payload(payload)
                .timestamp(System.currentTimeMillis())
                .build();

        broadcastToDocument(documentId, message, excludeSession);
    }

    private void broadcastToDocument(UUID documentId, DocumentUpdateMessage message,
                                     WebSocketSession excludeSession) {
        CopyOnWriteArraySet<WebSocketSession> sessions = documentSessions.get(documentId);
        if (sessions == null) {
            return;
        }

        String messageJson;
        try {
            messageJson = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("Error serializing message", e);
            return;
        }

        sessions.forEach(session -> {
            if (excludeSession == null || !session.getId().equals(excludeSession.getId())) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(messageJson));
                    }
                } catch (IOException e) {
                    log.error("Error sending message to session {}", session.getId(), e);
                }
            }
        });
    }

    private UUID extractDocumentId(WebSocketSession session) {
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        if (parts.length > 0) {
            try {
                return UUID.fromString(parts[parts.length - 1]);
            } catch (IllegalArgumentException e) {
                log.error("Invalid document ID in path: {}", path);
            }
        }
        return null;
    }

    private String extractUserId(WebSocketSession session) {
        return (String) session.getAttributes().get("userId");
    }

    private String extractUserName(WebSocketSession session) {
        return (String) session.getAttributes().get("userName");
    }

    private String extractUserEmail(WebSocketSession session) {
        return (String) session.getAttributes().get("userEmail");
    }
}
