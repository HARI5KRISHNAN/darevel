package com.whooper.docker.service;

import com.whooper.docker.dto.NamespaceDTO;
import com.whooper.docker.dto.PodDTO;
import com.whooper.docker.dto.PodMetricsDTO;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.Configuration;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.*;
import io.kubernetes.client.util.Config;
import io.kubernetes.client.custom.Quantity;
import io.kubernetes.client.Metrics;
import io.kubernetes.client.custom.PodMetrics;
import io.kubernetes.client.custom.PodMetricsList;
import io.kubernetes.client.custom.ContainerMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KubernetesService {
    
    private static final Logger logger = LoggerFactory.getLogger(KubernetesService.class);
    
    private ApiClient apiClient;
    private CoreV1Api coreV1Api;
    private Metrics metricsApi;
    private boolean initialized = false;
    private boolean metricsAvailable = false;
    
    @PostConstruct
    public void init() {
        try {
            // Automatically load kubeconfig from default location
            // Tries in order: KUBECONFIG env var, ~/.kube/config, in-cluster config
            apiClient = Config.defaultClient();
            Configuration.setDefaultApiClient(apiClient);
            
            coreV1Api = new CoreV1Api(apiClient);
            
            // Initialize Metrics API client
            try {
                metricsApi = new Metrics(apiClient);
                metricsAvailable = true;
                logger.info("Kubernetes Metrics API initialized successfully");
            } catch (Exception e) {
                logger.warn("Metrics API not available: {}. Will use mock metrics.", e.getMessage());
                metricsAvailable = false;
            }
            
            initialized = true;
            logger.info("Kubernetes client initialized successfully");
        } catch (IOException e) {
            logger.warn("Failed to initialize Kubernetes client: {}. K8s features will be unavailable.", 
                       e.getMessage());
            initialized = false;
        } catch (Exception e) {
            logger.error("Error initializing Kubernetes client: {}", e.getMessage(), e);
            initialized = false;
        }
    }
    
    /**
     * Check if Kubernetes cluster is accessible
     */
    public boolean isKubernetesAvailable() {
        if (!initialized || coreV1Api == null) {
            return false;
        }
        
        try {
            // Try to list namespaces as a health check
            coreV1Api.listNamespace(null, null, null, null, null, 1, 
                                   null, null, null, false);
            return true;
        } catch (Exception e) {
            logger.debug("Kubernetes cluster is not accessible: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get all pods across all namespaces or in a specific namespace
     */
    public List<PodDTO> getAllPods(String namespace) {
        if (!initialized) {
            logger.warn("Kubernetes client is not initialized");
            return new ArrayList<>();
        }
        
        try {
            V1PodList podList;
            
            if (namespace != null && !namespace.isEmpty() && !namespace.equals("all")) {
                // Get pods from specific namespace
                podList = coreV1Api.listNamespacedPod(namespace, null, null, null, 
                                                     null, null, null, null, null, 
                                                     null, false);
                logger.info("Found {} pods in namespace {}", 
                           podList.getItems().size(), namespace);
            } else {
                // Get pods from all namespaces
                podList = coreV1Api.listPodForAllNamespaces(null, null, null, 
                                                           null, null, null, null, 
                                                           null, null, false);
                logger.info("Found {} pods across all namespaces", 
                           podList.getItems().size());
            }
            
            return podList.getItems().stream()
                    .map(this::mapPodToDTO)
                    .collect(Collectors.toList());
                    
        } catch (ApiException e) {
            logger.error("Kubernetes API error: {} - {}", e.getCode(), e.getResponseBody(), e);
            return new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error fetching pods: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Get pod metrics from Metrics API or mock data
     */
    public List<PodMetricsDTO> getPodMetrics(String namespace) {
        if (!initialized) {
            logger.warn("Kubernetes client is not initialized");
            return new ArrayList<>();
        }
        
        try {
            if (metricsAvailable && metricsApi != null) {
                return getPodMetricsFromAPI(namespace);
            } else {
                return getMockPodMetrics(namespace);
            }
        } catch (Exception e) {
            logger.warn("Error fetching metrics from API, falling back to mock: {}", e.getMessage());
            return getMockPodMetrics(namespace);
        }
    }
    
    /**
     * Get pod metrics from Kubernetes Metrics API
     */
    private List<PodMetricsDTO> getPodMetricsFromAPI(String namespace) {
        List<PodMetricsDTO> metricsList = new ArrayList<>();
        
        try {
            PodMetricsList podMetricsList;
            
            if (namespace != null && !namespace.isEmpty() && !namespace.equals("all")) {
                // Get metrics for specific namespace
                podMetricsList = metricsApi.getPodMetrics(namespace);
                logger.info("Fetched metrics for {} pods in namespace {}", 
                           podMetricsList.getItems().size(), namespace);
            } else {
                // Get metrics for all namespaces
                List<V1Namespace> namespaces = coreV1Api.listNamespace(null, null, null, 
                                                                       null, null, null, 
                                                                       null, null, null, false)
                                                        .getItems();
                
                for (V1Namespace ns : namespaces) {
                    try {
                        PodMetricsList nsMetrics = metricsApi.getPodMetrics(ns.getMetadata().getName());
                        if (nsMetrics != null && nsMetrics.getItems() != null) {
                            for (PodMetrics podMetrics : nsMetrics.getItems()) {
                                metricsList.add(mapPodMetricsToDTO(podMetrics));
                            }
                        }
                    } catch (Exception e) {
                        logger.debug("Could not fetch metrics for namespace {}: {}", 
                                   ns.getMetadata().getName(), e.getMessage());
                    }
                }
                
                logger.info("Fetched metrics for {} pods across all namespaces", metricsList.size());
                return metricsList;
            }
            
            // Map single namespace metrics
            if (podMetricsList != null && podMetricsList.getItems() != null) {
                for (PodMetrics podMetrics : podMetricsList.getItems()) {
                    metricsList.add(mapPodMetricsToDTO(podMetrics));
                }
            }
            
            return metricsList;
            
        } catch (ApiException e) {
            logger.error("Metrics API error: {} - {}", e.getCode(), e.getResponseBody());
            throw new RuntimeException("Failed to fetch pod metrics from API", e);
        } catch (Exception e) {
            logger.error("Error fetching pod metrics: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch pod metrics", e);
        }
    }
    
    /**
     * Get mock pod metrics when Metrics API is not available
     */
    private List<PodMetricsDTO> getMockPodMetrics(String namespace) {
        logger.info("Generating mock metrics for namespace: {}", namespace);
        
        try {
            List<PodDTO> pods = getAllPods(namespace);
            List<PodMetricsDTO> metricsList = new ArrayList<>();
            
            for (PodDTO pod : pods) {
                PodMetricsDTO metrics = new PodMetricsDTO();
                metrics.setName(pod.getName());
                metrics.setNamespace(pod.getNamespace());
                
                // Generate mock metrics (random values for demonstration)
                long mockCpu = (long) (Math.random() * 500); // 0-500m
                long mockMemory = (long) (50 + Math.random() * 450); // 50-500Mi
                
                metrics.setCpuMillicores(mockCpu);
                metrics.setMemoryMi(mockMemory);
                metrics.setCpuFormatted(mockCpu + "m");
                metrics.setMemoryFormatted(mockMemory + "Mi");
                metrics.setTimestamp(System.currentTimeMillis() / 1000);
                
                metricsList.add(metrics);
            }
            
            logger.info("Generated mock metrics for {} pods", metricsList.size());
            return metricsList;
            
        } catch (Exception e) {
            logger.error("Error generating mock metrics: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Map PodMetrics to PodMetricsDTO
     */
    private PodMetricsDTO mapPodMetricsToDTO(PodMetrics podMetrics) {
        PodMetricsDTO dto = new PodMetricsDTO();
        
        // Set pod name and namespace
        dto.setName(podMetrics.getMetadata().getName());
        dto.setNamespace(podMetrics.getMetadata().getNamespace());
        
        // Aggregate CPU and memory across all containers
        long totalCpuNano = 0;
        long totalMemoryBytes = 0;
        
        if (podMetrics.getContainers() != null) {
            for (ContainerMetrics container : podMetrics.getContainers()) {
                // CPU in nanocores
                Quantity cpuQuantity = container.getUsage().get("cpu");
                if (cpuQuantity != null) {
                    totalCpuNano += cpuQuantity.getNumber().longValue();
                }
                
                // Memory in bytes
                Quantity memoryQuantity = container.getUsage().get("memory");
                if (memoryQuantity != null) {
                    totalMemoryBytes += memoryQuantity.getNumber().longValue();
                }
            }
        }
        
        // Convert nanocores to millicores (1 core = 1000m = 1,000,000,000n)
        long cpuMillicores = totalCpuNano / 1_000_000;
        
        // Convert bytes to MiB (1 MiB = 1024 * 1024 bytes)
        long memoryMi = totalMemoryBytes / (1024 * 1024);
        
        dto.setCpuMillicores(cpuMillicores);
        dto.setMemoryMi(memoryMi);
        dto.setCpuFormatted(cpuMillicores + "m");
        dto.setMemoryFormatted(memoryMi + "Mi");
        dto.setTimestamp(System.currentTimeMillis() / 1000);
        
        return dto;
    }
    
    /**
     * Get all namespaces
     */
    public List<NamespaceDTO> getAllNamespaces() {
        if (!initialized) {
            logger.warn("Kubernetes client is not initialized");
            return new ArrayList<>();
        }
        
        try {
            V1NamespaceList namespaceList = coreV1Api.listNamespace(null, null, null, 
                                                                    null, null, null, 
                                                                    null, null, null, false);
            
            logger.info("Found {} namespaces", namespaceList.getItems().size());
            
            return namespaceList.getItems().stream()
                    .map(this::mapNamespaceToDTO)
                    .collect(Collectors.toList());
                    
        } catch (ApiException e) {
            logger.error("Kubernetes API error: {} - {}", e.getCode(), e.getResponseBody(), e);
            return new ArrayList<>();
        } catch (Exception e) {
            logger.error("Error fetching namespaces: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Map Kubernetes V1Pod to PodDTO
     */
    private PodDTO mapPodToDTO(V1Pod pod) {
        PodDTO dto = new PodDTO();
        
        // Basic information
        V1ObjectMeta metadata = pod.getMetadata();
        if (metadata != null) {
            dto.setName(metadata.getName());
            dto.setNamespace(metadata.getNamespace());
            
            // Calculate age
            if (metadata.getCreationTimestamp() != null) {
                OffsetDateTime creationTime = metadata.getCreationTimestamp();
                dto.setCreatedTime(creationTime.toInstant().getEpochSecond());
                dto.setAge(calculateAge(creationTime));
            } else {
                dto.setCreatedTime(0L);
                dto.setAge("Unknown");
            }
        }
        
        // Pod status
        V1PodStatus status = pod.getStatus();
        if (status != null) {
            dto.setStatus(status.getPhase() != null ? status.getPhase() : "Unknown");
            dto.setPodIP(status.getPodIP());
            dto.setNodeName(status.getHostIP());
            
            // Calculate restarts and ready status
            if (status.getContainerStatuses() != null && !status.getContainerStatuses().isEmpty()) {
                int totalRestarts = 0;
                int readyCount = 0;
                int totalCount = status.getContainerStatuses().size();
                
                for (V1ContainerStatus containerStatus : status.getContainerStatuses()) {
                    totalRestarts += containerStatus.getRestartCount();
                    if (Boolean.TRUE.equals(containerStatus.getReady())) {
                        readyCount++;
                    }
                }
                
                dto.setRestarts(totalRestarts);
                dto.setReady(readyCount + "/" + totalCount);
            } else {
                dto.setRestarts(0);
                dto.setReady("0/0");
            }
        } else {
            dto.setStatus("Unknown");
            dto.setRestarts(0);
            dto.setReady("0/0");
        }
        
        // Mock CPU and memory usage (set to 0.0 as requested)
        dto.setCpuUsage(0.0);
        dto.setMemoryUsage(0.0);
        
        return dto;
    }
    
    /**
     * Map Kubernetes V1Namespace to NamespaceDTO
     */
    private NamespaceDTO mapNamespaceToDTO(V1Namespace namespace) {
        NamespaceDTO dto = new NamespaceDTO();
        
        V1ObjectMeta metadata = namespace.getMetadata();
        if (metadata != null) {
            dto.setName(metadata.getName());
            
            // Calculate age
            if (metadata.getCreationTimestamp() != null) {
                OffsetDateTime creationTime = metadata.getCreationTimestamp();
                dto.setCreatedTime(creationTime.toInstant().getEpochSecond());
                dto.setAge(calculateAge(creationTime));
            } else {
                dto.setCreatedTime(0L);
                dto.setAge("Unknown");
            }
            
            // Set labels
            Map<String, String> labels = metadata.getLabels();
            dto.setLabels(labels != null ? labels : new HashMap<>());
        }
        
        // Namespace status
        V1NamespaceStatus status = namespace.getStatus();
        if (status != null && status.getPhase() != null) {
            dto.setStatus(status.getPhase());
        } else {
            dto.setStatus("Active");
        }
        
        return dto;
    }
    
    /**
     * Calculate human-readable age from creation timestamp
     */
    private String calculateAge(OffsetDateTime creationTime) {
        try {
            OffsetDateTime now = OffsetDateTime.now(ZoneId.systemDefault());
            Duration duration = Duration.between(creationTime, now);
            
            long days = duration.toDays();
            long hours = duration.toHours() % 24;
            long minutes = duration.toMinutes() % 60;
            
            if (days > 0) {
                return days + "d";
            } else if (hours > 0) {
                return hours + "h";
            } else if (minutes > 0) {
                return minutes + "m";
            } else {
                return "<1m";
            }
        } catch (Exception e) {
            logger.debug("Error calculating age: {}", e.getMessage());
            return "Unknown";
        }
    }
}
