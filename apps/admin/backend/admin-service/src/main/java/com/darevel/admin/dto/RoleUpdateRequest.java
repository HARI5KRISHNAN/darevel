package com.darevel.admin.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RoleUpdateRequest(@NotEmpty List<String> roles) {}
