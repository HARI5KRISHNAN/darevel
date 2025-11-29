package com.darevel.admin.controller;

import com.darevel.admin.config.TenantResolver;
import com.darevel.admin.dto.CreateUserRequest;
import com.darevel.admin.dto.PagedResponse;
import com.darevel.admin.dto.RoleUpdateRequest;
import com.darevel.admin.dto.UpdateUserRequest;
import com.darevel.admin.dto.UserResponse;
import com.darevel.admin.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserManagementService userService;
    private final TenantResolver tenantResolver;

    public UserController(UserManagementService userService, TenantResolver tenantResolver) {
        this.userService = userService;
        this.tenantResolver = tenantResolver;
    }

    @GetMapping
    public PagedResponse<UserResponse> listUsers(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestParam(required = false) String search,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "20") int size) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return userService.listUsers(orgId, search, page, size);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        return userService.getUser(orgId, id);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateUserRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        UserResponse response = userService.createUser(orgId, adminUserId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        return userService.updateUser(orgId, adminUserId, id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        userService.deleteUser(orgId, adminUserId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        userService.deactivateUser(orgId, adminUserId, id);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<Void> reactivate(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        userService.reactivateUser(orgId, adminUserId, id);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{id}/roles")
    public UserResponse updateRoles(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
        UUID orgId = tenantResolver.resolveOrgId(jwt, null);
        UUID adminUserId = tenantResolver.resolveUserId(jwt);
        return userService.updateRoles(orgId, adminUserId, id, request);
    }
}
