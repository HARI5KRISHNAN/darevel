package com.whooper.docker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public class ContainerDTO {
    
    private String id;
    private String name;
    private String image;
    private String status;
    
    @JsonProperty("created")
    private Long createdTime;
    
    @JsonProperty("restartCount")
    private Integer restartCount;
    
    @JsonProperty("cpuUsage")
    private Double cpuUsage;
    
    @JsonProperty("memoryUsage")
    private Double memoryUsage;
    
    // Constructor
    public ContainerDTO() {
    }
    
    public ContainerDTO(String id, String name, String image, String status, 
                       Long createdTime, Integer restartCount, 
                       Double cpuUsage, Double memoryUsage) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.status = status;
        this.createdTime = createdTime;
        this.restartCount = restartCount;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(Long createdTime) {
        this.createdTime = createdTime;
    }
    
    public Integer getRestartCount() {
        return restartCount;
    }
    
    public void setRestartCount(Integer restartCount) {
        this.restartCount = restartCount;
    }
    
    public Double getCpuUsage() {
        return cpuUsage;
    }
    
    public void setCpuUsage(Double cpuUsage) {
        this.cpuUsage = cpuUsage;
    }
    
    public Double getMemoryUsage() {
        return memoryUsage;
    }
    
    public void setMemoryUsage(Double memoryUsage) {
        this.memoryUsage = memoryUsage;
    }
    
    @Override
    public String toString() {
        return "ContainerDTO{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", image='" + image + '\'' +
                ", status='" + status + '\'' +
                ", createdTime=" + createdTime +
                ", restartCount=" + restartCount +
                ", cpuUsage=" + cpuUsage +
                ", memoryUsage=" + memoryUsage +
                '}';
    }
}
