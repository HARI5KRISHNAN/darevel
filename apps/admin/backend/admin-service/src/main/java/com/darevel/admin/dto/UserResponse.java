package com.darevel.admin.dto;

import com.darevel.admin.model.UserStatus;

import java.util.List;
import java.util.UUID;

public record UserResponse(
    UUID id,
    UUID orgId,
    String email,
    String fullName,
    UserStatus status,
    List<String> roles,
    List<String> teams
) {}
