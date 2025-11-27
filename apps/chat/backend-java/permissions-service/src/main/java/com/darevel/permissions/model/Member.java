package com.darevel.permissions.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Member {
    private Long id;
    private String name;
    private String email;
    private String status; // Active, Inactive
    private String role; // Admin, Editor, Viewer

    // Explicit all-args constructor
    public Member(Long id, String name, String email, String status, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.status = status;
        this.role = role;
    }

    // Explicit getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public enum Status {
        ACTIVE("Active"),
        INACTIVE("Inactive");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum Role {
        ADMIN("Admin"),
        EDITOR("Editor"),
        VIEWER("Viewer");

        private final String value;

        Role(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }
}
