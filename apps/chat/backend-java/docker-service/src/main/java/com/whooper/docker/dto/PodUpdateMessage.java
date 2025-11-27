package com.whooper.docker.dto;

import java.util.List;

/**
 * DTO for WebSocket pod update messages
 */
public class PodUpdateMessage {
    private String type; // "docker", "kubernetes", "openshift"
    private String action; // "added", "modified", "deleted"
    private long timestamp;
    private int totalCount;
    private List<?> pods;
    private String namespace;
    
    public PodUpdateMessage() {
    }
    
    public PodUpdateMessage(String type, String action, long timestamp, int totalCount, 
                           List<?> pods, String namespace) {
        this.type = type;
        this.action = action;
        this.timestamp = timestamp;
        this.totalCount = totalCount;
        this.pods = pods;
        this.namespace = namespace;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
    
    public int getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }
    
    public List<?> getPods() {
        return pods;
    }
    
    public void setPods(List<?> pods) {
        this.pods = pods;
    }
    
    public String getNamespace() {
        return namespace;
    }
    
    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }
    
    @Override
    public String toString() {
        return "PodUpdateMessage{" +
                "type='" + type + '\'' +
                ", action='" + action + '\'' +
                ", timestamp=" + timestamp +
                ", totalCount=" + totalCount +
                ", namespace='" + namespace + '\'' +
                '}';
    }
}
