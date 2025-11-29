package com.darevel.access.controller;

import com.darevel.access.controller.dto.PermissionResponse;
import com.darevel.access.repository.PermissionRepository;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/authz/permissions", produces = MediaType.APPLICATION_JSON_VALUE)
public class PermissionController {

    private final PermissionRepository permissionRepository;

    public PermissionController(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @GetMapping
    public List<PermissionResponse> listPermissions() {
        return permissionRepository.findAllByOrderByModuleAscNameAsc().stream()
                .map(permission -> new PermissionResponse(
                        permission.getId(),
                        permission.getCode(),
                        permission.getName(),
                        permission.getDescription(),
                        permission.getModule()))
                .toList();
    }
}
