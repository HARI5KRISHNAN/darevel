package com.darevel.permissions.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class PermissionUpdateResponse {
    private String user;
    private String email;
    private String tool;
    private String access;
    private String executor;
    private LocalDateTime timestamp;
    private String executionTime;
    private String output;

    // Explicit no-args constructor (Lombok backup)
    public PermissionUpdateResponse() {
    }

    // Explicit all-args constructor
    public PermissionUpdateResponse(String user, String email, String tool, String access,
                                   String executor, LocalDateTime timestamp, String executionTime, String output) {
        this.user = user;
        this.email = email;
        this.tool = tool;
        this.access = access;
        this.executor = executor;
        this.timestamp = timestamp;
        this.executionTime = executionTime;
        this.output = output;
    }

    // Explicit setters for all fields (Lombok backup)
    public void setUser(String user) {
        this.user = user;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTool(String tool) {
        this.tool = tool;
    }

    public void setAccess(String access) {
        this.access = access;
    }

    public void setExecutor(String executor) {
        this.executor = executor;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setExecutionTime(String executionTime) {
        this.executionTime = executionTime;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    // Explicit getters (Lombok backup)
    public String getUser() { return user; }
    public String getEmail() { return email; }
    public String getTool() { return tool; }
    public String getAccess() { return access; }
    public String getExecutor() { return executor; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getExecutionTime() { return executionTime; }
    public String getOutput() { return output; }
}
