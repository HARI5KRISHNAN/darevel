package com.whooper.docker.service;

import com.whooper.docker.dto.ContainerDTO;
import com.whooper.docker.dto.PodDTO;
import com.whooper.docker.dto.OpenShiftPodDTO;
import com.whooper.docker.dto.PodUpdateMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for broadcasting pod updates via WebSocket
 */
@Service
public class WebSocketBroadcastService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketBroadcastService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private DockerService dockerService;
    
    @Autowired
    private KubernetesService kubernetesService;
    
    @Autowired
    private OpenShiftService openShiftService;
    
    private int dockerLastCount = -1;
    private int k8sLastCount = -1;
    private int openshiftLastCount = -1;
    
    /**
     * Broadcast Docker container updates every 10 seconds
     */
    @Scheduled(fixedRate = 10000)
    public void broadcastDockerUpdates() {
        if (!dockerService.isDockerAvailable()) {
            return;
        }
        
        try {
            List<ContainerDTO> containers = dockerService.getAllContainers();
            
            // Only broadcast if count changed
            if (containers.size() != dockerLastCount) {
                PodUpdateMessage message = new PodUpdateMessage(
                    "docker",
                    dockerLastCount == -1 ? "initial" : (containers.size() > dockerLastCount ? "added" : "removed"),
                    System.currentTimeMillis(),
                    containers.size(),
                    containers,
                    "default"
                );
                
                messagingTemplate.convertAndSend("/topic/pod-updates", message);
                logger.debug("Broadcasted Docker update: {} containers", containers.size());
                
                dockerLastCount = containers.size();
            }
        } catch (Exception e) {
            logger.error("Error broadcasting Docker updates: {}", e.getMessage());
        }
    }
    
    /**
     * Broadcast Kubernetes pod updates every 10 seconds
     */
    @Scheduled(fixedRate = 10000)
    public void broadcastKubernetesUpdates() {
        if (!kubernetesService.isKubernetesAvailable()) {
            return;
        }
        
        try {
            List<PodDTO> pods = kubernetesService.getAllPods("all");
            
            // Only broadcast if count changed
            if (pods.size() != k8sLastCount) {
                PodUpdateMessage message = new PodUpdateMessage(
                    "kubernetes",
                    k8sLastCount == -1 ? "initial" : (pods.size() > k8sLastCount ? "added" : "removed"),
                    System.currentTimeMillis(),
                    pods.size(),
                    pods,
                    "all"
                );
                
                messagingTemplate.convertAndSend("/topic/pod-updates", message);
                logger.debug("Broadcasted Kubernetes update: {} pods", pods.size());
                
                k8sLastCount = pods.size();
            }
        } catch (Exception e) {
            logger.error("Error broadcasting Kubernetes updates: {}", e.getMessage());
        }
    }
    
    /**
     * Broadcast OpenShift pod updates every 10 seconds
     */
    @Scheduled(fixedRate = 10000)
    public void broadcastOpenShiftUpdates() {
        if (!openShiftService.isOpenShiftAvailable()) {
            return;
        }
        
        try {
            List<OpenShiftPodDTO> pods = openShiftService.getAllPods("all");
            
            // Only broadcast if count changed
            if (pods.size() != openshiftLastCount) {
                PodUpdateMessage message = new PodUpdateMessage(
                    "openshift",
                    openshiftLastCount == -1 ? "initial" : (pods.size() > openshiftLastCount ? "added" : "removed"),
                    System.currentTimeMillis(),
                    pods.size(),
                    pods,
                    "all"
                );
                
                messagingTemplate.convertAndSend("/topic/pod-updates", message);
                logger.debug("Broadcasted OpenShift update: {} pods", pods.size());
                
                openshiftLastCount = pods.size();
            }
        } catch (Exception e) {
            logger.error("Error broadcasting OpenShift updates: {}", e.getMessage());
        }
    }
    
    /**
     * Manually trigger a broadcast for all services
     */
    public void triggerManualBroadcast() {
        logger.info("Triggering manual broadcast for all services");
        broadcastDockerUpdates();
        broadcastKubernetesUpdates();
        broadcastOpenShiftUpdates();
    }
}
