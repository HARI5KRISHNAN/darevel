package com.whooper.docker.dto;

import java.util.Map;

/**
 * DTO for OpenShift Pod information
 */
public class OpenShiftPodDTO {
    private String name;
    private String namespace;
    private String phase;
    private int restarts;
    private Map<String, String> labels;
    private String age;
    
    public OpenShiftPodDTO() {
    }
    
    public OpenShiftPodDTO(String name, String namespace, String phase, int restarts, 
                          Map<String, String> labels, String age) {
        this.name = name;
        this.namespace = namespace;
        this.phase = phase;
        this.restarts = restarts;
        this.labels = labels;
        this.age = age;
    }
    
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
    
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
    }
    
    public int getRestarts() {
        return restarts;
    }
    
    public void setRestarts(int restarts) {
        this.restarts = restarts;
    }
    
    public Map<String, String> getLabels() {
        return labels;
    }
    
    public void setLabels(Map<String, String> labels) {
        this.labels = labels;
    }
    
    public String getAge() {
        return age;
    }
    
    public void setAge(String age) {
        this.age = age;
    }
    
    @Override
    public String toString() {
        return "OpenShiftPodDTO{" +
                "name='" + name + '\'' +
                ", namespace='" + namespace + '\'' +
                ", phase='" + phase + '\'' +
                ", restarts=" + restarts +
                ", labels=" + labels +
                ", age='" + age + '\'' +
                '}';
    }
}
