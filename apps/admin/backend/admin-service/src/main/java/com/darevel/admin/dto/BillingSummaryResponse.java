package com.darevel.admin.dto;

import java.time.LocalDate;
import java.util.UUID;

public record BillingSummaryResponse(
    UUID orgId,
    String plan,
    String status,
    LocalDate renewalDate,
    int seatsUsed,
    int seatsTotal
) {}
