package com.darevel.permissions.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.permissions.dto.PermissionUpdateRequest;
import com.darevel.permissions.dto.PermissionUpdateResponse;
import com.darevel.permissions.model.Member;
import com.darevel.permissions.service.PermissionsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PermissionsController {

    private final PermissionsService permissionsService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<PermissionUpdateResponse>> updatePermission(
            @Valid @RequestBody PermissionUpdateRequest request) {
        try {
            PermissionUpdateResponse response = permissionsService.updatePermission(request);
            String message = String.format("✅ Successfully applied %s permissions for %s on %s",
                    request.getAccess(), request.getUser(), request.getTool());
            return ResponseEntity.ok(ApiResponse.success(message, response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update permission: " + e.getMessage()));
        }
    }

    @GetMapping("/members")
    public ResponseEntity<ApiResponse<List<Member>>> getMembers() {
        List<Member> members = permissionsService.getMembers();
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @PutMapping("/members/role")
    public ResponseEntity<ApiResponse<Member>> updateMemberRole(@RequestBody Map<String, Object> request) {
        try {
            Long id = Long.parseLong(request.get("id").toString());
            String role = request.get("role").toString();

            Member member = permissionsService.updateMemberRole(id, role);
            String message = "Successfully updated role for " + member.getName();

            return ResponseEntity.ok(ApiResponse.success(message, member));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/members")
    public ResponseEntity<ApiResponse<Member>> addMember(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String email = request.get("email");
            String role = request.getOrDefault("role", "Viewer");

            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Name is required"));
            }

            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }

            Member member = permissionsService.addMember(name, email, role);
            String message = "Successfully added member " + name;

            return ResponseEntity.ok(ApiResponse.success(message, member));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<ApiResponse<Member>> deleteMember(@PathVariable Long id) {
        try {
            Member member = permissionsService.deleteMember(id);
            String message = "Successfully deleted member " + member.getName();

            return ResponseEntity.ok(ApiResponse.success(message, member));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/ansible/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkAnsibleStatus() {
        try {
            boolean available = permissionsService.checkAnsibleStatus();
            String version = available ? permissionsService.getAnsibleVersion() : null;

            Map<String, Object> data = new HashMap<>();
            data.put("available", available);
            data.put("version", version);

            String message = available ? "Ansible is available" : "Ansible is not installed or not in PATH";

            return ResponseEntity.ok(ApiResponse.success(message, data));
        } catch (Exception e) {
            Map<String, Object> data = new HashMap<>();
            data.put("available", false);
            data.put("version", null);

            return ResponseEntity.ok(ApiResponse.success("Ansible is not available", data));
        }
    }

    @GetMapping("/audit/history")
    public ResponseEntity<ApiResponse<List<Object>>> getAuditHistory() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Audit logs are not available. MongoDB has been removed from this application."));
    }

    @GetMapping("/audit/stats")
    public ResponseEntity<ApiResponse<List<Object>>> getAuditStats() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Audit stats are not available. MongoDB has been removed from this application."));
    }

    @GetMapping("/audit/{id}")
    public ResponseEntity<ApiResponse<Object>> getAuditById(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Audit logs are not available. MongoDB has been removed from this application."));
    }
}
