package com.darevel.billing.controller.dto;

import java.util.Map;
import java.util.UUID;

public record LimitCheckResponse(
        UUID orgId,
        boolean planActive,
        boolean canCreateUser,
        boolean canUploadFile,
        boolean canSendEmail,
        boolean canCreateDoc,
        Integer maxUsers,
        Integer currentUsers,
        Integer remainingUsers,
        Double maxStorageGb,
        Double storageUsedGb,
        Map<String, Boolean> features,
        String message) {}
