package com.darevel.permissions.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermissionUpdateRequest {

    @NotBlank(message = "User is required")
    private String user;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Tool is required")
    private String tool; // jenkins, kubernetes, docker, git

    @NotBlank(message = "Access is required")
    private String access; // read, write, execute

    private String executor = "system";
    private String namespace = "default"; // For Kubernetes
    private String gitRepo = "darevel/main-repo"; // For Git
    private String gitServerType = "gitea"; // gitea, gitlab, github
}
