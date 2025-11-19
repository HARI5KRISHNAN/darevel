package com.darevel.kubernetes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodMetrics {
    private String cpuUsage;
    private String memoryUsage;
    private String cpuLimit;
    private String memoryLimit;
    private Double cpuPercentage;
    private Double memoryPercentage;
}
