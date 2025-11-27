package com.whooper.docker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PodMetricsDTO {
    
    private String name;
    private String namespace;
    
    @JsonProperty("cpuMillicores")
    private Long cpuMillicores;
    
    @JsonProperty("memoryMi")
    private Long memoryMi;
    
    @JsonProperty("cpuFormatted")
    private String cpuFormatted;
    
    @JsonProperty("memoryFormatted")
    private String memoryFormatted;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    // Constructor
    public PodMetricsDTO() {
    }
    
    public PodMetricsDTO(String name, String namespace, Long cpuMillicores, 
                        Long memoryMi, String cpuFormatted, String memoryFormatted,
                        Long timestamp) {
        this.name = name;
        this.namespace = namespace;
        this.cpuMillicores = cpuMillicores;
        this.memoryMi = memoryMi;
        this.cpuFormatted = cpuFormatted;
        this.memoryFormatted = memoryFormatted;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getNamespace() {
        return namespace;
    }
    
    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }
    
    public Long getCpuMillicores() {
        return cpuMillicores;
    }
    
    public void setCpuMillicores(Long cpuMillicores) {
        this.cpuMillicores = cpuMillicores;
    }
    
    public Long getMemoryMi() {
        return memoryMi;
    }
    
    public void setMemoryMi(Long memoryMi) {
        this.memoryMi = memoryMi;
    }
    
    public String getCpuFormatted() {
        return cpuFormatted;
    }
    
    public void setCpuFormatted(String cpuFormatted) {
        this.cpuFormatted = cpuFormatted;
    }
    
    public String getMemoryFormatted() {
        return memoryFormatted;
    }
    
    public void setMemoryFormatted(String memoryFormatted) {
        this.memoryFormatted = memoryFormatted;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
    
    @Override
    public String toString() {
        return "PodMetricsDTO{" +
                "name='" + name + '\'' +
                ", namespace='" + namespace + '\'' +
                ", cpuMillicores=" + cpuMillicores +
                ", memoryMi=" + memoryMi +
                ", cpuFormatted='" + cpuFormatted + '\'' +
                ", memoryFormatted='" + memoryFormatted + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
