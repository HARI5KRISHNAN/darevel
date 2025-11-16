package com.darevel.permissions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermissionUpdateResponse {
    private String user;
    private String email;
    private String tool;
    private String access;
    private String executor;
    private LocalDateTime timestamp;
    private String executionTime;
    private String output;
}
