package com.darevel.chat.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for generating Jitsi Meet JWT tokens.
 * These tokens allow authenticated users to join video calls.
 */
@Service
public class JitsiJwtService {

    private static final Logger log = LoggerFactory.getLogger(JitsiJwtService.class);

    @Value("${jitsi.jwt.app-id:darevel}")
    private String appId;

    @Value("${jitsi.jwt.app-secret:darevel_jitsi_secret_key_2024}")
    private String appSecret;

    @Value("${jitsi.jwt.token-expiry-hours:24}")
    private int tokenExpiryHours;

    @Value("${jitsi.domain:meet.jitsi}")
    private String jitsiDomain;

    /**
     * Generate a JWT token for Jitsi Meet.
     *
     * @param roomName    The room name the user wants to join
     * @param userId      The user's ID
     * @param userName    The user's display name
     * @param userEmail   The user's email
     * @param userAvatar  The user's avatar URL (optional)
     * @param isModerator Whether the user should have moderator privileges
     * @return The generated JWT token
     */
    public String generateToken(String roomName, String userId, String userName,
                                String userEmail, String userAvatar, boolean isModerator) {

        log.info("Generating Jitsi JWT for user: {} ({}), room: {}, moderator: {}",
                userName, userEmail, roomName, isModerator);

        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(tokenExpiryHours * 3600L);

        // Build user context
        Map<String, Object> userContext = new HashMap<>();
        userContext.put("id", userId);
        userContext.put("name", userName);
        userContext.put("email", userEmail);
        if (userAvatar != null && !userAvatar.isEmpty()) {
            userContext.put("avatar", userAvatar);
        }

        // Build features context
        Map<String, Object> features = new HashMap<>();
        features.put("livestreaming", false);
        features.put("recording", true);
        features.put("transcription", false);
        features.put("outbound-call", false);

        // Build context object
        Map<String, Object> context = new HashMap<>();
        context.put("user", userContext);
        context.put("features", features);

        // Get signing key
        SecretKey key = Keys.hmacShaKeyFor(appSecret.getBytes(StandardCharsets.UTF_8));

        // Build the JWT
        // Note: Using claim("aud", appId) instead of .audience() to ensure
        // the audience is a string, not an array. Jitsi expects a string.
        String token = Jwts.builder()
                .header()
                    .add("alg", "HS256")
                    .add("typ", "JWT")
                .and()
                .issuer(appId)
                .subject(jitsiDomain)
                .claim("aud", appId)
                .claim("room", roomName)
                .claim("context", context)
                .claim("moderator", isModerator)
                .issuedAt(Date.from(now))
                .notBefore(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key, Jwts.SIG.HS256)
                .compact();

        log.info("Generated Jitsi JWT token for room: {}", roomName);
        return token;
    }

    /**
     * Generate a simple JWT token for a user to join a room.
     */
    public String generateToken(String roomName, String userId, String userName, String userEmail) {
        return generateToken(roomName, userId, userName, userEmail, null, false);
    }

    /**
     * Generate a moderator JWT token for a user.
     */
    public String generateModeratorToken(String roomName, String userId, String userName,
                                         String userEmail, String userAvatar) {
        return generateToken(roomName, userId, userName, userEmail, userAvatar, true);
    }
}
