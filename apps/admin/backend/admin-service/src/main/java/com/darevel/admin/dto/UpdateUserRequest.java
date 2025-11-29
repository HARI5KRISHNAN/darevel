package com.darevel.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record UpdateUserRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(min = 2, max = 120) String fullName,
    List<String> roles,
    List<UUID> teamIds
) {}
