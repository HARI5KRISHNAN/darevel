package com.darevel.chat.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service to interact with Auth service for user lookups
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Value("${auth.service.url:http://localhost:8080}")
    private String authServiceUrl;

    private final RestTemplate restTemplate;

    public UserService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Convert email addresses to user IDs by querying auth service.
     * Uses find-or-create to auto-register Keycloak SSO users.
     */
    public List<Long> convertEmailsToUserIds(List<String> emails) {
        if (emails == null || emails.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> userIds = new ArrayList<>();

        for (String email : emails) {
            try {
                // First try direct lookup
                Long userId = getUserIdByEmail(email);

                // If not found, try find-or-create
                if (userId == null) {
                    log.info("User not found for email {}, trying find-or-create", email);
                    userId = findOrCreateUserByEmail(email, null);
                }

                if (userId != null) {
                    userIds.add(userId);
                } else {
                    log.warn("Could not find or create user for email: {}", email);
                }
            } catch (Exception e) {
                log.error("Error fetching user ID for email {}: {}", email, e.getMessage());
            }
        }

        return userIds;
    }

    /**
     * Get user ID by email from auth service
     */
    public Long getUserIdByEmail(String email) {
        try {
            String url = authServiceUrl + "/api/auth/users/email/" + email;
            log.info("Fetching user ID for email: {} from {}", email, url);

            // Auth service returns ApiResponse wrapper
            ResponseEntity<ApiResponseWrapper> response = restTemplate.getForEntity(url, ApiResponseWrapper.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ApiResponseWrapper wrapper = response.getBody();
                if (wrapper.isSuccess() && wrapper.getData() != null) {
                    Long userId = wrapper.getData().getId();
                    log.info("Found user ID {} for email {}", userId, email);
                    return userId;
                }
            }
        } catch (RestClientException e) {
            log.warn("User not found by email {}, will try find-or-create: {}", email, e.getMessage());
        }

        return null;
    }

    /**
     * Find or create a user by email (for Keycloak SSO users)
     */
    public Long findOrCreateUserByEmail(String email, String name) {
        try {
            String url = authServiceUrl + "/api/auth/users/find-or-create";
            log.info("Finding or creating user for email: {} with name: {}", email, name);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("email", email);
            requestBody.put("name", name);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<ApiResponseWrapper> response = restTemplate.postForEntity(url, request, ApiResponseWrapper.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ApiResponseWrapper wrapper = response.getBody();
                if (wrapper.isSuccess() && wrapper.getData() != null) {
                    Long userId = wrapper.getData().getId();
                    log.info("Found/created user ID {} for email {}", userId, email);
                    return userId;
                }
            }
        } catch (RestClientException e) {
            log.error("Failed to find-or-create user by email {}: {}", email, e.getMessage());
        }

        return null;
    }

    /**
     * Wrapper for ApiResponse from auth service
     */
    public static class ApiResponseWrapper {
        private boolean success;
        private String message;
        private UserDto data;

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public UserDto getData() { return data; }
        public void setData(UserDto data) { this.data = data; }
    }

    /**
     * Get user details by ID
     */
    public UserDto getUserById(Long userId) {
        try {
            String url = authServiceUrl + "/api/auth/users/" + userId;
            ResponseEntity<ApiResponseWrapper> response = restTemplate.getForEntity(url, ApiResponseWrapper.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ApiResponseWrapper wrapper = response.getBody();
                if (wrapper.isSuccess() && wrapper.getData() != null) {
                    return wrapper.getData();
                }
            }
        } catch (RestClientException e) {
            log.error("Failed to fetch user by ID {}: {}", userId, e.getMessage());
        }

        return null;
    }

    /**
     * Get multiple users by their IDs
     */
    public Map<Long, UserDto> getUsersByIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, UserDto> usersMap = new HashMap<>();
        
        for (Long userId : userIds) {
            UserDto user = getUserById(userId);
            if (user != null) {
                usersMap.put(userId, user);
            }
        }

        return usersMap;
    }

    /**
     * DTO for User data from auth service
     */
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;

        public UserDto() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
    }
}
