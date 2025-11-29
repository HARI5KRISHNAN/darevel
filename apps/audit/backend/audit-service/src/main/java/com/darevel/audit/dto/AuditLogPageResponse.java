package com.darevel.audit.dto;

import java.util.List;
import lombok.Builder;
import lombok.Value;
import org.springframework.data.domain.Page;

@Value
@Builder
public class AuditLogPageResponse {
    List<AuditLogResponse> data;
    PaginationMeta meta;

    public static AuditLogPageResponse from(Page<AuditLogResponse> page) {
        PaginationMeta meta = PaginationMeta.builder()
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
        return AuditLogPageResponse.builder()
                .data(page.getContent())
                .meta(meta)
                .build();
    }
}
