package com.darevel.dashboard.controller;

import com.darevel.dashboard.dto.ApiResponse;
import com.darevel.dashboard.model.User;
import com.darevel.dashboard.model.UserPreferences;
import com.darevel.dashboard.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private String getUserId(Jwt jwt) {
        return jwt.getSubject();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String keycloakId = getUserId(jwt);
        User user = userService.getUserByKeycloakId(keycloakId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<ApiResponse<User>> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createOrUpdateUser(
            @RequestBody User user,
            @AuthenticationPrincipal Jwt jwt) {
        user.setKeycloakId(getUserId(jwt));
        User saved = userService.createOrUpdateUser(user);
        return ResponseEntity.ok(ApiResponse.success(saved, "User created/updated successfully"));
    }

    @GetMapping("/{userId}/preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> getUserPreferences(@PathVariable Long userId) {
        UserPreferences preferences = userService.getUserPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(preferences));
    }

    @PutMapping("/{userId}/preferences")
    public ResponseEntity<ApiResponse<UserPreferences>> updateUserPreferences(
            @PathVariable Long userId,
            @RequestBody UserPreferences preferences) {
        UserPreferences updated = userService.updateUserPreferences(userId, preferences);
        return ResponseEntity.ok(ApiResponse.success(updated, "Preferences updated successfully"));
    }
}
