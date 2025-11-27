package com.whooper.docker.service;

import com.whooper.docker.dto.OpenShiftPodDTO;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.ContainerStatus;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.openshift.client.DefaultOpenShiftClient;
import io.fabric8.openshift.client.OpenShiftClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing OpenShift cluster operations
 */
@Service
public class OpenShiftService {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenShiftService.class);
    
    private OpenShiftClient client;
    private boolean initialized = false;
    
    @PostConstruct
    public void init() {
        try {
            // Auto-configure from kubeconfig or in-cluster config
            Config config = new ConfigBuilder().build();
            this.client = new DefaultOpenShiftClient(config);
            
            // Test connection
            String version = client.getKubernetesVersion().getGitVersion();
            logger.info("OpenShift client initialized successfully. Kubernetes version: {}", version);
            
            this.initialized = true;
        } catch (Exception e) {
            logger.warn("OpenShift client initialization failed: {}. Service will be unavailable.", e.getMessage());
            this.initialized = false;
        }
    }
    
    /**
     * Check if OpenShift client is available
     */
    public boolean isOpenShiftAvailable() {
        return initialized && client != null;
    }
    
    /**
     * Get all pods from OpenShift cluster
     */
    public List<OpenShiftPodDTO> getAllPods(String namespace) {
        if (!isOpenShiftAvailable()) {
            logger.warn("OpenShift client not available");
            return new ArrayList<>();
        }
        
        try {
            List<Pod> pods;
            
            if ("all".equalsIgnoreCase(namespace)) {
                // Get pods from all namespaces
                pods = client.pods().inAnyNamespace().list().getItems();
                logger.info("Fetched {} pods from all namespaces", pods.size());
            } else {
                // Get pods from specific namespace
                pods = client.pods().inNamespace(namespace).list().getItems();
                logger.info("Fetched {} pods from namespace: {}", pods.size(), namespace);
            }
            
            return pods.stream()
                    .map(this::mapPodToDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            logger.error("Error fetching OpenShift pods: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch OpenShift pods", e);
        }
    }
    
    /**
     * Map Fabric8 Pod to OpenShiftPodDTO
     */
    private OpenShiftPodDTO mapPodToDTO(Pod pod) {
        String name = pod.getMetadata().getName();
        String namespace = pod.getMetadata().getNamespace();
        String phase = pod.getStatus().getPhase();
        
        // Calculate total restarts from all containers
        int totalRestarts = 0;
        if (pod.getStatus().getContainerStatuses() != null) {
            for (ContainerStatus status : pod.getStatus().getContainerStatuses()) {
                totalRestarts += status.getRestartCount();
            }
        }
        
        // Get labels
        Map<String, String> labels = pod.getMetadata().getLabels();
        if (labels == null) {
            labels = new HashMap<>();
        }
        
        // Calculate age
        String age = calculateAge(pod.getMetadata().getCreationTimestamp());
        
        return new OpenShiftPodDTO(name, namespace, phase, totalRestarts, labels, age);
    }
    
    /**
     * Calculate age from creation timestamp
     */
    private String calculateAge(String creationTimestamp) {
        try {
            Instant created = Instant.parse(creationTimestamp);
            Instant now = Instant.now();
            Duration duration = Duration.between(created, now);
            
            long days = duration.toDays();
            long hours = duration.toHours() % 24;
            long minutes = duration.toMinutes() % 60;
            
            if (days > 0) {
                return days + "d" + hours + "h";
            } else if (hours > 0) {
                return hours + "h" + minutes + "m";
            } else {
                return minutes + "m";
            }
        } catch (Exception e) {
            logger.warn("Failed to parse creation timestamp: {}", creationTimestamp);
            return "Unknown";
        }
    }
    
    @PreDestroy
    public void cleanup() {
        if (client != null) {
            try {
                client.close();
                logger.info("OpenShift client closed successfully");
            } catch (Exception e) {
                logger.error("Error closing OpenShift client: {}", e.getMessage());
            }
        }
    }
}
