package com.darevel.user.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.common.dto.UserDTO;
import com.darevel.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUserProfile(Authentication authentication) {
        UserDTO user = userService.getCurrentUser(authentication);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable String userId) {
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            Authentication authentication,
            @RequestBody UserDTO userDTO) {
        UserDTO updated = userService.updateProfile(authentication, userDTO);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
