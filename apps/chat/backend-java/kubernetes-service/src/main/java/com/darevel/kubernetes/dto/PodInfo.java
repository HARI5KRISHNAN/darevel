package com.darevel.kubernetes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PodInfo {
    private String name;
    private String namespace;
    private String status;
    private String phase;
    private List<ContainerInfo> containers;
    private Map<String, String> labels;
    private String nodeName;
    private String podIP;
    private String createdAt;
    private Integer restartCount;
    private PodMetrics metrics;
    private List<PodCondition> conditions;
}
