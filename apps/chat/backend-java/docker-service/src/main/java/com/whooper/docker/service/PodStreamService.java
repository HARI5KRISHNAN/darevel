package com.whooper.docker.service;

import com.whooper.docker.dto.PodDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;

/**
 * Service for managing pod streaming operations
 */
@Service
public class PodStreamService {
    
    private static final Logger logger = LoggerFactory.getLogger(PodStreamService.class);
    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes
    private static final long EMIT_INTERVAL = 5000L; // 5 seconds
    
    @Autowired
    private KubernetesService kubernetesService;
    
    @Autowired
    private OpenShiftService openShiftService;
    
    private final Set<SseEmitter> emitters = ConcurrentHashMap.newKeySet();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private ScheduledFuture<?> scheduledTask;
    
    /**
     * Create a new SSE emitter for pod streaming
     */
    public SseEmitter createEmitter(String source, String namespace) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        
        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            logger.info("SSE connection completed. Active connections: {}", emitters.size());
        });
        
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            logger.info("SSE connection timed out. Active connections: {}", emitters.size());
        });
        
        emitter.onError((e) -> {
            emitters.remove(emitter);
            logger.error("SSE connection error: {}", e.getMessage());
        });
        
        emitters.add(emitter);
        logger.info("New SSE connection established. Active connections: {}", emitters.size());
        
        // Start streaming if this is the first emitter
        if (emitters.size() == 1) {
            startStreaming(source, namespace);
        }
        
        // Send initial data immediately
        sendPodUpdate(emitter, source, namespace);
        
        return emitter;
    }
    
    /**
     * Start the scheduled task to emit pod updates
     */
    private void startStreaming(String source, String namespace) {
        if (scheduledTask != null && !scheduledTask.isDone()) {
            return; // Already streaming
        }
        
        logger.info("Starting pod streaming for source: {}, namespace: {}", source, namespace);
        
        scheduledTask = scheduler.scheduleAtFixedRate(() -> {
            if (emitters.isEmpty()) {
                stopStreaming();
                return;
            }
            
            // Send updates to all connected clients
            Set<SseEmitter> deadEmitters = new HashSet<>();
            for (SseEmitter emitter : emitters) {
                try {
                    sendPodUpdate(emitter, source, namespace);
                } catch (Exception e) {
                    logger.error("Error sending SSE update: {}", e.getMessage());
                    deadEmitters.add(emitter);
                }
            }
            
            // Remove dead emitters
            emitters.removeAll(deadEmitters);
            
        }, EMIT_INTERVAL, EMIT_INTERVAL, TimeUnit.MILLISECONDS);
    }
    
    /**
     * Stop the scheduled streaming task
     */
    private void stopStreaming() {
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
            scheduledTask = null;
            logger.info("Pod streaming stopped");
        }
    }
    
    /**
     * Send pod update to a specific emitter
     */
    private void sendPodUpdate(SseEmitter emitter, String source, String namespace) {
        try {
            List<?> pods;
            
            if ("kubernetes".equalsIgnoreCase(source)) {
                if (kubernetesService.isKubernetesAvailable()) {
                    pods = kubernetesService.getAllPods(namespace);
                } else {
                    pods = Collections.emptyList();
                }
            } else if ("openshift".equalsIgnoreCase(source)) {
                if (openShiftService.isOpenShiftAvailable()) {
                    pods = openShiftService.getAllPods(namespace);
                } else {
                    pods = Collections.emptyList();
                }
            } else {
                // Default to kubernetes
                if (kubernetesService.isKubernetesAvailable()) {
                    pods = kubernetesService.getAllPods(namespace);
                } else {
                    pods = Collections.emptyList();
                }
            }
            
            Map<String, Object> data = new HashMap<>();
            data.put("timestamp", System.currentTimeMillis());
            data.put("source", source);
            data.put("namespace", namespace);
            data.put("pods", pods);
            data.put("count", pods.size());
            
            emitter.send(SseEmitter.event()
                    .name("pod-update")
                    .data(data));
                    
        } catch (IOException e) {
            logger.error("Error sending pod update: {}", e.getMessage());
            emitter.completeWithError(e);
            emitters.remove(emitter);
        }
    }
    
    /**
     * Get count of active SSE connections
     */
    public int getActiveConnectionCount() {
        return emitters.size();
    }
}
