package com.whooper.docker.controller;

import com.whooper.docker.service.PodStreamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * REST Controller for pod streaming operations
 */
@RestController
@RequestMapping("/api/pods")
public class PodStreamController {
    
    private static final Logger logger = LoggerFactory.getLogger(PodStreamController.class);
    
    @Autowired
    private PodStreamService podStreamService;
    
    /**
     * GET /api/pods/stream
     * Server-Sent Events endpoint that emits updated pod list every 5 seconds
     * 
     * @param source Source system (kubernetes or openshift), defaults to kubernetes
     * @param namespace Kubernetes namespace, defaults to "all"
     * @return SseEmitter for streaming pod updates
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPods(
            @RequestParam(value = "source", required = false, defaultValue = "kubernetes") String source,
            @RequestParam(value = "namespace", required = false, defaultValue = "all") String namespace) {
        
        logger.info("GET /api/pods/stream - source: {}, namespace: {}", source, namespace);
        
        return podStreamService.createEmitter(source, namespace);
    }
    
    /**
     * GET /api/pods/stream/status
     * Returns status of the streaming service
     */
    @GetMapping("/stream/status")
    public String getStreamStatus() {
        int activeConnections = podStreamService.getActiveConnectionCount();
        return String.format("Active SSE connections: %d", activeConnections);
    }
}
