package com.darevel.chat.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Base64;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Utility class for extracting JWT token information
 * Simplified version without Spring Security OAuth2 dependency
 */
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get current user ID from JWT token in Authorization header
     */
    public static Long getCurrentUserId() {
        Map<String, Object> claims = getJwtClaims();
        if (claims == null) {
            log.warn("No JWT claims available");
            return null;
        }

        // Log all claims for debugging
        log.info("JWT Claims: {}", claims.keySet());
        log.debug("Full JWT Claims: {}", claims);

        // Try to get user ID from different claim names
        Object userId = claims.get("user_id");
        if (userId == null) {
            userId = claims.get("sub");
        }
        if (userId == null) {
            userId = claims.get("userId");
        }

        if (userId == null) {
            log.warn("No user ID found in JWT claims. Available keys: {}", claims.keySet());
        } else {
            log.info("Found user ID in JWT: {} (type: {})", userId, userId.getClass().getSimpleName());
        }

        return parseUserId(userId);
    }

    /**
     * Get current user email from JWT token
     */
    public static String getCurrentUserEmail() {
        Map<String, Object> claims = getJwtClaims();
        if (claims == null) {
            return null;
        }

        String email = (String) claims.get("email");
        if (email == null) {
            email = (String) claims.get("preferred_username");
        }

        return email;
    }

    /**
     * Get current user name from JWT token
     */
    public static String getCurrentUserName() {
        Map<String, Object> claims = getJwtClaims();
        if (claims == null) {
            return null;
        }

        String name = (String) claims.get("name");
        if (name == null) {
            name = (String) claims.get("given_name");
        }
        if (name == null) {
            name = (String) claims.get("preferred_username");
        }

        return name;
    }

    /**
     * Get all claims from current JWT token
     */
    public static Map<String, Object> getAllClaims() {
        return getJwtClaims();
    }

    /**
     * Extract JWT claims from Authorization header
     */
    private static Map<String, Object> getJwtClaims() {
        try {
            HttpServletRequest request = getCurrentRequest();
            if (request == null) {
                log.debug("No HTTP request context available");
                return null;
            }

            String authHeader = request.getHeader("Authorization");
            log.info("Authorization header present: {}", authHeader != null);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("No Bearer token in Authorization header. Header value: {}", 
                    authHeader != null ? authHeader.substring(0, Math.min(20, authHeader.length())) + "..." : "null");
                return null;
            }

            String token = authHeader.substring(7);
            log.info("Extracted JWT token, length: {}", token.length());
            
            return parseJwtToken(token);

        } catch (Exception e) {
            log.error("Error extracting JWT claims: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Parse JWT token and extract claims (payload)
     */
    @SuppressWarnings("unchecked")
    private static Map<String, Object> parseJwtToken(String token) {
        try {
            // JWT format: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                log.warn("Invalid JWT token format");
                return null;
            }

            // Decode payload (second part)
            String payload = parts[1];
            byte[] decodedBytes = Base64.getUrlDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);

            // Parse JSON to Map
            return objectMapper.readValue(decodedPayload, Map.class);

        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get current HTTP request from Spring context
     */
    private static HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            log.debug("Unable to get current request: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Parse user ID from various object types
     */
    private static Long parseUserId(Object userId) {
        if (userId == null) {
            return null;
        }

        try {
            if (userId instanceof Long) {
                return (Long) userId;
            } else if (userId instanceof Integer) {
                return ((Integer) userId).longValue();
            } else if (userId instanceof String) {
                return Long.parseLong((String) userId);
            }
        } catch (NumberFormatException e) {
            log.warn("Cannot parse user ID from: {}", userId);
        }

        return null;
    }
}
