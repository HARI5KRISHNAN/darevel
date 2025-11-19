package com.darevel.kubernetes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodCondition {
    private String type;
    private String status;
    private String reason;
    private String message;
    private String lastTransitionTime;
}
