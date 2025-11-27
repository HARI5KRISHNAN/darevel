package com.darevel.permissions.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
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

    // Explicit all-args constructor
    public PermissionUpdateRequest(String user, String email, String tool, String access,
                                   String executor, String namespace, String gitRepo, String gitServerType) {
        this.user = user;
        this.email = email;
        this.tool = tool;
        this.access = access;
        this.executor = executor;
        this.namespace = namespace;
        this.gitRepo = gitRepo;
        this.gitServerType = gitServerType;
    }

    // Explicit getters
    public String getAccess() {
        return access;
    }

    public String getUser() {
        return user;
    }

    public String getTool() {
        return tool;
    }

    public String getEmail() {
        return email;
    }

    public String getNamespace() {
        return namespace;
    }

    public String getGitRepo() {
        return gitRepo;
    }

    public String getGitServerType() {
        return gitServerType;
    }

    public String getExecutor() {
        return executor;
    }
}
