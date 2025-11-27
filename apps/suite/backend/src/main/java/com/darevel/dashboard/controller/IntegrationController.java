package com.darevel.dashboard.controller;

import com.darevel.dashboard.dto.ApiResponse;
import com.darevel.dashboard.model.Integration;
import com.darevel.dashboard.service.IntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/integrations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class IntegrationController {

    private final IntegrationService integrationService;

    private String getUserId(Jwt jwt) {
        return jwt.getSubject();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Integration>>> getAllIntegrations(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        List<Integration> integrations = integrationService.getAllIntegrations(userId);
        return ResponseEntity.ok(ApiResponse.success(integrations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Integration>> getIntegrationById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        Integration integration = integrationService.getIntegrationById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(integration));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Integration>> createIntegration(
            @RequestBody Integration integration,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        integration.setOwnerId(userId);

        Integration created = integrationService.createIntegration(integration);
        return ResponseEntity.ok(ApiResponse.success(created, "Integration created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Integration>> updateIntegration(
            @PathVariable Long id,
            @RequestBody Integration integration,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        Integration updated = integrationService.updateIntegration(id, userId, integration);
        return ResponseEntity.ok(ApiResponse.success(updated, "Integration updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteIntegration(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        integrationService.deleteIntegration(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Integration deleted successfully"));
    }
}
