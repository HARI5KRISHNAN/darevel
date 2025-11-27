package com.whooper.docker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class NamespaceDTO {
    
    private String name;
    private String status;
    
    @JsonProperty("createdTime")
    private Long createdTime;
    
    @JsonProperty("age")
    private String age;
    
    @JsonProperty("labels")
    private java.util.Map<String, String> labels;
    
    // Constructor
    public NamespaceDTO() {
    }
    
    public NamespaceDTO(String name, String status, Long createdTime, String age, 
                       java.util.Map<String, String> labels) {
        this.name = name;
        this.status = status;
        this.createdTime = createdTime;
        this.age = age;
        this.labels = labels;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
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
    
    public String getAge() {
        return age;
    }
    
    public void setAge(String age) {
        this.age = age;
    }
    
    public java.util.Map<String, String> getLabels() {
        return labels;
    }
    
    public void setLabels(java.util.Map<String, String> labels) {
        this.labels = labels;
    }
    
    @Override
    public String toString() {
        return "NamespaceDTO{" +
                "name='" + name + '\'' +
                ", status='" + status + '\'' +
                ", createdTime=" + createdTime +
                ", age='" + age + '\'' +
                ", labels=" + labels +
                '}';
    }
}
