package com.darevel.wiki.space.dto;

import java.util.UUID;

public record SpaceMemberResponse(
    UUID userId,
    String role
) { }
