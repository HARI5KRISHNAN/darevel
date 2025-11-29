package com.darevel.audit.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class PaginationMeta {
    int page;
    int size;
    long total;
    int totalPages;
}
