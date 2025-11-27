package com.darevel.chat.controller;

import com.darevel.chat.service.JitsiJwtService;
import com.darevel.chat.service.MeetingService;
import com.darevel.chat.util.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for Jitsi-related operations including JWT token generation.
 */
@RestController
@RequestMapping("/api/jitsi")
@CrossOrigin(origins = "*")
public class JitsiController {

    private static final Logger log = LoggerFactory.getLogger(JitsiController.class);

    private final JitsiJwtService jitsiJwtService;
    private final MeetingService meetingService;

    public JitsiController(JitsiJwtService jitsiJwtService, MeetingService meetingService) {
        this.jitsiJwtService = jitsiJwtService;
        this.meetingService = meetingService;
    }

    /**
     * Generate a JWT token for joining a Jitsi meeting.
     * This endpoint is called by the frontend when a user wants to join a video call.
     *
     * @param room The room name to join
     * @return JWT token and meeting info
     */
    @GetMapping("/token")
    public ResponseEntity<Map<String, Object>> getToken(
            @AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt,
            @RequestParam String room) {
        log.info("Token requested for room: {}", room);

        if (jwt == null) {
            log.warn("No JWT token found in request");
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Authentication required to join meeting");
            return ResponseEntity.status(401).body(error);
        }

        // Get user info from Keycloak JWT
        String userEmail = jwt.getClaimAsString("email");
        String userName = jwt.getClaimAsString("name");
        String userId = jwt.getSubject();

        log.info("User info - ID: {}, Email: {}, Name: {}", userId, userEmail, userName);

        // If no user info from JWT, return error
        if (userEmail == null || userEmail.isEmpty()) {
            log.warn("No authenticated user found for token request");
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Authentication required to join meeting");
            return ResponseEntity.status(401).body(error);
        }

        // Use email as userId if subject is UUID
        String jitsiUserId = userId;

        // Check if user is the meeting organizer (moderator)
        boolean isModerator = false;
        try {
            var meetingOpt = meetingService.getMeetingByRoomName(room);
            if (meetingOpt.isPresent()) {
                var meeting = meetingOpt.get();
                // User is moderator if they are the organizer
                if (userId != null && userId.equals(meeting.getOrganizerId().toString())) {
                    isModerator = true;
                }
                log.info("Meeting found: {}, organizer: {}, current user is moderator: {}",
                        meeting.getTitle(), meeting.getOrganizerId(), isModerator);
            }
        } catch (Exception e) {
            log.warn("Could not check meeting organizer: {}", e.getMessage());
        }

        // Generate Jitsi JWT token
        String token = jitsiJwtService.generateToken(
                room,
                jitsiUserId,
                userName != null ? userName : userEmail.split("@")[0],
                userEmail,
                null,
                isModerator
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("room", room);
        response.put("user", Map.of(
                "id", jitsiUserId,
                "name", userName != null ? userName : userEmail.split("@")[0],
                "email", userEmail,
                "isModerator", isModerator
        ));

        log.info("Token generated successfully for room: {}, user: {}", room, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a JWT token with custom user info (for testing or special cases).
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, Object>> generateToken(@RequestBody Map<String, Object> request) {
        String room = (String) request.get("room");
        String userName = (String) request.get("userName");
        String userEmail = (String) request.get("userEmail");
        String userId = (String) request.get("userId");
        Boolean isModerator = (Boolean) request.getOrDefault("isModerator", false);

        if (room == null || room.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "Room name is required");
            return ResponseEntity.badRequest().body(error);
        }

        // Fallback to Keycloak JWT if no user info provided
        if (userEmail == null || userEmail.isEmpty()) {
            userEmail = JwtUtils.getCurrentUserEmail();
            userName = JwtUtils.getCurrentUserName();
        }

        if (userEmail == null || userEmail.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "User email is required");
            return ResponseEntity.badRequest().body(error);
        }

        if (userId == null || userId.isEmpty()) {
            Long keycloakUserId = JwtUtils.getCurrentUserId();
            userId = keycloakUserId != null ? keycloakUserId.toString() : userEmail;
        }

        if (userName == null || userName.isEmpty()) {
            userName = userEmail.split("@")[0];
        }

        String token = jitsiJwtService.generateToken(
                room,
                userId,
                userName,
                userEmail,
                null,
                isModerator
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("token", token);
        response.put("room", room);
        response.put("user", Map.of(
                "id", userId,
                "name", userName,
                "email", userEmail,
                "isModerator", isModerator
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint for Jitsi integration.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "jitsi-jwt");
        return ResponseEntity.ok(response);
    }
}
