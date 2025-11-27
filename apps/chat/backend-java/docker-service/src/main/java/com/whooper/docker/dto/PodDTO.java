package com.whooper.docker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PodDTO {
    
    private String name;
    private String namespace;
    private String status;
    
    @JsonProperty("age")
    private String age;
    
    @JsonProperty("restarts")
    private Integer restarts;
    
    @JsonProperty("cpuUsage")
    private Double cpuUsage;
    
    @JsonProperty("memoryUsage")
    private Double memoryUsage;
    
    @JsonProperty("podIP")
    private String podIP;
    
    @JsonProperty("nodeName")
    private String nodeName;
    
    @JsonProperty("ready")
    private String ready;
    
    @JsonProperty("createdTime")
    private Long createdTime;
    
    // Constructor
    public PodDTO() {
    }
    
    public PodDTO(String name, String namespace, String status, String age, 
                  Integer restarts, Double cpuUsage, Double memoryUsage, 
                  String podIP, String nodeName, String ready, Long createdTime) {
        this.name = name;
        this.namespace = namespace;
        this.status = status;
        this.age = age;
        this.restarts = restarts;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.podIP = podIP;
        this.nodeName = nodeName;
        this.ready = ready;
        this.createdTime = createdTime;
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getAge() {
        return age;
    }
    
    public void setAge(String age) {
        this.age = age;
    }
    
    public Integer getRestarts() {
        return restarts;
    }
    
    public void setRestarts(Integer restarts) {
        this.restarts = restarts;
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
    
    public String getPodIP() {
        return podIP;
    }
    
    public void setPodIP(String podIP) {
        this.podIP = podIP;
    }
    
    public String getNodeName() {
        return nodeName;
    }
    
    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }
    
    public String getReady() {
        return ready;
    }
    
    public void setReady(String ready) {
        this.ready = ready;
    }
    
    public Long getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(Long createdTime) {
        this.createdTime = createdTime;
    }
    
    @Override
    public String toString() {
        return "PodDTO{" +
                "name='" + name + '\'' +
                ", namespace='" + namespace + '\'' +
                ", status='" + status + '\'' +
                ", age='" + age + '\'' +
                ", restarts=" + restarts +
                ", cpuUsage=" + cpuUsage +
                ", memoryUsage=" + memoryUsage +
                ", podIP='" + podIP + '\'' +
                ", nodeName='" + nodeName + '\'' +
                ", ready='" + ready + '\'' +
                ", createdTime=" + createdTime +
                '}';
    }
}
