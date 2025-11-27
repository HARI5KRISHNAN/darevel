package com.whooper.docker.controller;

import com.whooper.docker.dto.NamespaceDTO;
import com.whooper.docker.dto.PodDTO;
import com.whooper.docker.dto.PodMetricsDTO;
import com.whooper.docker.service.KubernetesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/k8s")
public class KubernetesController {
    
    private static final Logger logger = LoggerFactory.getLogger(KubernetesController.class);
    
    @Autowired
    private KubernetesService kubernetesService;
    
    /**
     * GET /api/k8s/pods
     * Returns all Kubernetes pods
     */
    @GetMapping("/pods")
    public ResponseEntity<Map<String, Object>> getPods(
            @RequestParam(value = "namespace", required = false, defaultValue = "all") String namespace) {
        
        logger.info("GET /api/k8s/pods - namespace: {}", namespace);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if Kubernetes is available
            if (!kubernetesService.isKubernetesAvailable()) {
                response.put("success", false);
                response.put("message", "Kubernetes cluster is not accessible");
                response.put("data", List.of());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch pods
            List<PodDTO> pods = kubernetesService.getAllPods(namespace);
            
            response.put("success", true);
            response.put("message", "Pods fetched successfully");
            response.put("data", pods);
            response.put("count", pods.size());
            response.put("namespace", namespace);
            
            logger.info("Successfully fetched {} pods", pods.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching pods: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch pods: " + e.getMessage());
            response.put("data", List.of());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/k8s/namespaces
     * Returns all Kubernetes namespaces
     */
    @GetMapping("/namespaces")
    public ResponseEntity<Map<String, Object>> getNamespaces() {
        
        logger.info("GET /api/k8s/namespaces");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if Kubernetes is available
            if (!kubernetesService.isKubernetesAvailable()) {
                response.put("success", false);
                response.put("message", "Kubernetes cluster is not accessible");
                response.put("data", List.of());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch namespaces
            List<NamespaceDTO> namespaces = kubernetesService.getAllNamespaces();
            
            response.put("success", true);
            response.put("message", "Namespaces fetched successfully");
            response.put("data", namespaces);
            response.put("count", namespaces.size());
            
            logger.info("Successfully fetched {} namespaces", namespaces.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching namespaces: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch namespaces: " + e.getMessage());
            response.put("data", List.of());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/k8s/pods/metrics
     * Returns pod metrics (CPU and Memory usage)
     */
    @GetMapping("/pods/metrics")
    public ResponseEntity<Map<String, Object>> getPodMetrics(
            @RequestParam(value = "namespace", required = false, defaultValue = "all") String namespace) {
        
        logger.info("GET /api/k8s/pods/metrics - namespace: {}", namespace);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if Kubernetes is available
            if (!kubernetesService.isKubernetesAvailable()) {
                response.put("success", false);
                response.put("message", "Kubernetes cluster is not accessible");
                response.put("data", List.of());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch pod metrics
            List<PodMetricsDTO> metrics = kubernetesService.getPodMetrics(namespace);
            
            response.put("success", true);
            response.put("message", "Pod metrics fetched successfully");
            response.put("data", metrics);
            response.put("count", metrics.size());
            response.put("namespace", namespace);
            
            logger.info("Successfully fetched metrics for {} pods", metrics.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching pod metrics: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch pod metrics: " + e.getMessage());
            response.put("data", List.of());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/k8s/health
     * Health check endpoint for Kubernetes service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        boolean k8sAvailable = kubernetesService.isKubernetesAvailable();
        
        response.put("success", k8sAvailable);
        response.put("kubernetesAvailable", k8sAvailable);
        response.put("message", k8sAvailable 
                ? "Kubernetes cluster is accessible" 
                : "Kubernetes cluster is not accessible");
        
        return k8sAvailable 
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
