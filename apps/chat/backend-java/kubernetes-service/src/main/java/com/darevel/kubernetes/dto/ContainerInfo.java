package com.darevel.kubernetes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContainerInfo {
    private String name;
    private String image;
    private String state;
    private Integer restartCount;
    private Boolean ready;
    private String reason;
    private String message;
}
