package com.darevel.access.controller.dto;

import java.util.List;
import java.util.UUID;

public record TeamAssignmentsResponse(UUID teamId, List<UUID> roleIds) {}
