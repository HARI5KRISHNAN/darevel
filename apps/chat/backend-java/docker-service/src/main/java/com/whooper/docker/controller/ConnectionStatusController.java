package com.whooper.docker.controller;

import com.whooper.docker.service.DockerService;
import com.whooper.docker.service.KubernetesService;
import com.whooper.docker.service.OpenShiftService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for connection status checks
 */
@RestController
@RequestMapping("/api")
public class ConnectionStatusController {
    
    private static final Logger logger = LoggerFactory.getLogger(ConnectionStatusController.class);
    
    @Autowired
    private DockerService dockerService;
    
    @Autowired
    private KubernetesService kubernetesService;
    
    @Autowired
    private OpenShiftService openShiftService;
    
    /**
     * GET /api/connection-status
     * Returns connection status for all services
     */
    @GetMapping("/connection-status")
    public ResponseEntity<Map<String, String>> getConnectionStatus() {
        logger.info("GET /api/connection-status");
        
        Map<String, String> status = new HashMap<>();
        
        // Check Docker connection
        String dockerStatus = dockerService.isDockerAvailable() ? "connected" : "disconnected";
        status.put("docker", dockerStatus);
        
        // Check Kubernetes connection
        String k8sStatus = kubernetesService.isKubernetesAvailable() ? "connected" : "disconnected";
        status.put("kubernetes", k8sStatus);
        
        // Check OpenShift connection
        String openshiftStatus = openShiftService.isOpenShiftAvailable() ? "connected" : "disconnected";
        status.put("openshift", openshiftStatus);
        
        logger.info("Connection status - Docker: {}, Kubernetes: {}, OpenShift: {}", 
                   dockerStatus, k8sStatus, openshiftStatus);
        
        return ResponseEntity.ok(status);
    }
}
