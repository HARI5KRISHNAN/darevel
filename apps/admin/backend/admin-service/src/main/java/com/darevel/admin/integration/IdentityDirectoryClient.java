package com.darevel.admin.integration;

import com.darevel.admin.config.AdminProperties;
import com.darevel.admin.exception.RemoteServiceException;
import com.darevel.admin.model.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class IdentityDirectoryClient {

    private static final Logger log = LoggerFactory.getLogger(IdentityDirectoryClient.class);

    private final RestTemplate restTemplate;
    private final AdminProperties properties;

    public IdentityDirectoryClient(RestTemplate restTemplate, AdminProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    public PagedUsers fetchUsers(UUID orgId, String search, int page, int size) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("page", String.valueOf(page));
        params.add("size", String.valueOf(size));
        if (search != null && !search.isBlank()) {
            params.add("search", search);
        }
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path("/api/identity/orgs/{orgId}/users")
            .queryParams(params)
            .build(orgId)
            .toString();
        try {
            ResponseEntity<PagedUsers> response = restTemplate.getForEntity(url, PagedUsers.class);
            PagedUsers body = response.getBody();
            if (body == null) {
                return new PagedUsers(Collections.emptyList(), 0, page, size);
            }
            return body;
        } catch (RestClientException ex) {
            log.warn("Failed to load users from identity service: {}", ex.getMessage());
            throw new RemoteServiceException("identity-service", "Unable to load users", ex);
        }
    }

    public UserProfile getUser(UUID orgId, UUID userId) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path("/api/identity/orgs/{orgId}/users/{userId}")
            .build(orgId, userId)
            .toString();
        try {
            ResponseEntity<UserProfile> response = restTemplate.getForEntity(url, UserProfile.class);
            UserProfile body = response.getBody();
            if (body == null) {
                throw new RemoteServiceException("identity-service", "Missing user payload");
            }
            return body;
        } catch (RestClientException ex) {
            throw new RemoteServiceException("identity-service", "Unable to fetch user", ex);
        }
    }

    public UserProfile createUser(UUID orgId, CreateOrUpdateUser payload) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path("/api/identity/orgs/{orgId}/users")
            .build(orgId)
            .toString();
        try {
            ResponseEntity<UserProfile> response = restTemplate.postForEntity(url, payload, UserProfile.class);
            UserProfile body = response.getBody();
            if (body == null) {
                throw new RemoteServiceException("identity-service", "Missing create response");
            }
            return body;
        } catch (RestClientException ex) {
            throw new RemoteServiceException("identity-service", "Unable to create user", ex);
        }
    }

    public UserProfile updateUser(UUID orgId, UUID userId, CreateOrUpdateUser payload) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path("/api/identity/orgs/{orgId}/users/{userId}")
            .build(orgId, userId)
            .toString();
        try {
            ResponseEntity<UserProfile> response = restTemplate.exchange(url, HttpMethod.PUT, new HttpEntity<>(payload), UserProfile.class);
            UserProfile body = response.getBody();
            if (body == null) {
                throw new RemoteServiceException("identity-service", "Missing update response");
            }
            return body;
        } catch (RestClientException ex) {
            throw new RemoteServiceException("identity-service", "Unable to update user", ex);
        }
    }

    public void deleteUser(UUID orgId, UUID userId) {
        exchangeWithoutBody(orgId, userId, HttpMethod.DELETE, null, "Unable to delete user");
    }

    public void deactivateUser(UUID orgId, UUID userId) {
        exchangeWithoutBody(orgId, userId, HttpMethod.POST, "/deactivate", "Unable to deactivate user");
    }

    public void reactivateUser(UUID orgId, UUID userId) {
        exchangeWithoutBody(orgId, userId, HttpMethod.POST, "/reactivate", "Unable to reactivate user");
    }

    public UserProfile updateRoles(UUID orgId, UUID userId, List<String> roles) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path("/api/identity/orgs/{orgId}/users/{userId}/roles")
            .build(orgId, userId)
            .toString();
        try {
            ResponseEntity<UserProfile> response = restTemplate.postForEntity(url, Collections.singletonMap("roles", roles), UserProfile.class);
            UserProfile body = response.getBody();
            if (body == null) {
                throw new RemoteServiceException("identity-service", "Missing role update response");
            }
            return body;
        } catch (RestClientException ex) {
            throw new RemoteServiceException("identity-service", "Unable to update roles", ex);
        }
    }

    private void exchangeWithoutBody(UUID orgId, UUID userId, HttpMethod method, String subPath, String errorMessage) {
        String urlTemplate = "/api/identity/orgs/{orgId}/users/{userId}" + (subPath != null ? subPath : "");
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl())
            .path(urlTemplate)
            .build(orgId, userId)
            .toString();
        try {
            restTemplate.exchange(url, method, HttpEntity.EMPTY, Void.class);
        } catch (RestClientException ex) {
            throw new RemoteServiceException("identity-service", errorMessage, ex);
        }
    }

    private String baseUrl() {
        return properties.getIntegrations().getIdentityBaseUrl();
    }

    public record CreateOrUpdateUser(String email, String fullName, List<String> roles) {}

    public record UserProfile(UUID id, UUID orgId, String email, String fullName, UserStatus status, List<String> roles) {}

    public record PagedUsers(List<UserProfile> content, long totalElements, int page, int size) {}
}
