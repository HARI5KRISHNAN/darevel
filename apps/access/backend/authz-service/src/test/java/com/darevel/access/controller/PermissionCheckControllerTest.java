package com.darevel.access.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darevel.access.service.PermissionEvaluationService;
import com.darevel.access.service.dto.PermissionEvaluationResult;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PermissionCheckController.class)
@Import(PermissionCheckControllerTest.TestSecurityConfig.class)
class PermissionCheckControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PermissionEvaluationService permissionEvaluationService;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable()).authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    @DisplayName("should return evaluation payload when service grants permission")
    void shouldReturnEvaluationResult() throws Exception {
        PermissionEvaluationResult result = new PermissionEvaluationResult(
                true,
                true,
                List.of(UUID.randomUUID()),
                List.of(UUID.randomUUID()),
                List.of("DOC_EDIT"));
        when(permissionEvaluationService.evaluate(any())).thenReturn(result);

        UUID workspaceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        String requestBody = """
                                {
                                    "permissionCode": "DOC_EDIT",
                                    "subjectUserId": "%s",
                                    "teamIds": ["%s"],
                                    "resource": {
                                        "resourceId": "file-123",
                                        "resourceType": "DOCUMENT"
                                    }
                                }
                                """.formatted(userId, UUID.randomUUID());

        mockMvc.perform(post("/api/authz/check")
                        .header("X-Org-Id", workspaceId.toString())
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.granted").value(true))
                .andExpect(jsonPath("$.viaResourceOverride").value(true))
                .andExpect(jsonPath("$.matchedRoleIds[0]").isNotEmpty());

        verify(permissionEvaluationService).evaluate(any());
    }

    @Test
    @DisplayName("should reject blank workspace header")
    void shouldRejectBlankWorkspaceHeader() throws Exception {
        UUID userId = UUID.randomUUID();
        String requestBody = """
                    {"permissionCode":"DOC_EDIT"}
                    """;

        mockMvc.perform(post("/api/authz/check")
                        .header("X-Org-Id", " ")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("should reject request missing permission code")
    void shouldRejectMissingPermissionCode() throws Exception {
        UUID workspaceId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        String requestBody = "{}";

        mockMvc.perform(post("/api/authz/check")
                        .header("X-Org-Id", workspaceId.toString())
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest());
    }
}
