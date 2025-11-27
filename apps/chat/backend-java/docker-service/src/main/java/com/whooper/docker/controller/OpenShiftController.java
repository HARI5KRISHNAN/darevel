package com.whooper.docker.controller;

import com.whooper.docker.dto.OpenShiftPodDTO;
import com.whooper.docker.service.OpenShiftService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for OpenShift operations
 */
@RestController
@RequestMapping("/api/openshift")
public class OpenShiftController {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenShiftController.class);
    
    @Autowired
    private OpenShiftService openShiftService;
    
    /**
     * GET /api/openshift/pods
     * Returns list of pods from OpenShift cluster
     */
    @GetMapping("/pods")
    public ResponseEntity<Map<String, Object>> getPods(
            @RequestParam(value = "namespace", required = false, defaultValue = "all") String namespace) {
        
        logger.info("GET /api/openshift/pods - namespace: {}", namespace);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if OpenShift is available
            if (!openShiftService.isOpenShiftAvailable()) {
                response.put("success", false);
                response.put("message", "OpenShift cluster is not accessible");
                response.put("data", List.of());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch pods
            List<OpenShiftPodDTO> pods = openShiftService.getAllPods(namespace);
            
            response.put("success", true);
            response.put("message", "Pods fetched successfully");
            response.put("data", pods);
            response.put("count", pods.size());
            response.put("namespace", namespace);
            
            logger.info("Successfully fetched {} pods from namespace: {}", pods.size(), namespace);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching OpenShift pods: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch pods: " + e.getMessage());
            response.put("data", List.of());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/openshift/health
     * Health check endpoint for OpenShift service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        boolean available = openShiftService.isOpenShiftAvailable();
        
        response.put("service", "openshift");
        response.put("status", available ? "UP" : "DOWN");
        response.put("message", available ? "OpenShift cluster is accessible" : "OpenShift cluster is not accessible");
        
        return ResponseEntity.ok(response);
    }
}
