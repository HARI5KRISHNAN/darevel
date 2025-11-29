package com.darevel.access.controller.dto;

import java.util.List;
import java.util.UUID;

public record UserAssignmentsResponse(UUID userId, List<UUID> roleIds) {}
