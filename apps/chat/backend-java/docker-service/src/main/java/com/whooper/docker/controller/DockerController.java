package com.whooper.docker.controller;

import com.whooper.docker.dto.ContainerDTO;
import com.whooper.docker.service.DockerService;
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
@RequestMapping("/api/docker")
public class DockerController {
    
    private static final Logger logger = LoggerFactory.getLogger(DockerController.class);
    
    @Autowired
    private DockerService dockerService;
    
    /**
     * GET /api/docker/containers
     * Returns all Docker containers with their details
     */
    @GetMapping("/containers")
    public ResponseEntity<Map<String, Object>> getContainers(
            @RequestParam(value = "running", required = false, defaultValue = "false") boolean runningOnly) {
        
        logger.info("GET /api/docker/containers - runningOnly: {}", runningOnly);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if Docker is available
            if (!dockerService.isDockerAvailable()) {
                response.put("success", false);
                response.put("message", "Docker daemon is not accessible");
                response.put("data", List.of());
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch containers
            List<ContainerDTO> containers = runningOnly 
                    ? dockerService.getRunningContainers()
                    : dockerService.getAllContainers();
            
            response.put("success", true);
            response.put("message", "Containers fetched successfully");
            response.put("data", containers);
            response.put("count", containers.size());
            
            logger.info("Successfully fetched {} containers", containers.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching containers: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch containers: " + e.getMessage());
            response.put("data", List.of());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/docker/containers/{id}/logs
     * Returns logs for a specific container
     */
    @GetMapping("/containers/{id}/logs")
    public ResponseEntity<Map<String, Object>> getContainerLogs(
            @PathVariable String id,
            @RequestParam(value = "tail", required = false, defaultValue = "100") Integer tail,
            @RequestParam(value = "timestamps", required = false, defaultValue = "false") boolean timestamps) {
        
        logger.info("GET /api/docker/containers/{}/logs - tail: {}, timestamps: {}", id, tail, timestamps);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if Docker is available
            if (!dockerService.isDockerAvailable()) {
                response.put("success", false);
                response.put("message", "Docker daemon is not accessible");
                response.put("logs", "");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
            
            // Fetch container logs
            String logs = dockerService.getContainerLogs(id, tail, timestamps);
            
            if (logs == null) {
                response.put("success", false);
                response.put("message", "Container not found or logs unavailable");
                response.put("logs", "");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            response.put("success", true);
            response.put("message", "Logs fetched successfully");
            response.put("logs", logs);
            response.put("containerId", id);
            response.put("tail", tail);
            
            logger.info("Successfully fetched logs for container {}", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error fetching logs for container {}: {}", id, e.getMessage(), e);
            
            response.put("success", false);
            response.put("message", "Failed to fetch logs: " + e.getMessage());
            response.put("logs", "");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * GET /api/docker/health
     * Health check endpoint for Docker service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        boolean dockerAvailable = dockerService.isDockerAvailable();
        
        response.put("success", dockerAvailable);
        response.put("dockerAvailable", dockerAvailable);
        response.put("message", dockerAvailable 
                ? "Docker daemon is accessible" 
                : "Docker daemon is not accessible");
        
        return dockerAvailable 
                ? ResponseEntity.ok(response)
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
