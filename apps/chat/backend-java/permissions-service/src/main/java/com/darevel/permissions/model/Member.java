package com.darevel.permissions.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    private Long id;
    private String name;
    private String email;
    private String status; // Active, Inactive
    private String role; // Admin, Editor, Viewer

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
