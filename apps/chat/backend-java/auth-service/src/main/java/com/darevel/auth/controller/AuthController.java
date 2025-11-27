package com.darevel.auth.controller;

import com.darevel.auth.dto.AuthResponse;
import com.darevel.auth.dto.LoginRequest;
import com.darevel.auth.dto.RegisterRequest;
import com.darevel.common.dto.UserDto;
import com.darevel.auth.service.AuthService;
import com.darevel.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/register", produces = "application/json", consumes = "application/json")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping(value = "/login", produces = "application/json", consumes = "application/json")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping(value = "/users", produces = "application/json")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = authService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/users")
    public ResponseEntity<ApiResponse<Void>> clearAllUsers() {
        authService.clearAllUsers();
        return ResponseEntity.ok(ApiResponse.success("All users deleted successfully", null));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable("id") Long id) {
        try {
            UserDto user = authService.getUserById(id);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByEmail(@PathVariable("email") String email) {
        try {
            UserDto user = authService.getUserByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/users/find-or-create")
    public ResponseEntity<ApiResponse<UserDto>> findOrCreateUser(@RequestBody java.util.Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }
            UserDto user = authService.findOrCreateUserByEmail(email, name);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
