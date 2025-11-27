package com.whooper.docker.controller;

import com.whooper.docker.service.WebSocketBroadcastService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket controller for pod updates
 */
@RestController
@RequestMapping("/api/ws")
public class WebSocketController {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);
    
    @Autowired
    private WebSocketBroadcastService broadcastService;
    
    /**
     * Trigger manual broadcast of all pod updates
     */
    @GetMapping("/trigger-broadcast")
    public ResponseEntity<Map<String, Object>> triggerBroadcast() {
        logger.info("Manual broadcast triggered via REST endpoint");
        
        broadcastService.triggerManualBroadcast();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Broadcast triggered successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Health check for WebSocket service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "websocket");
        response.put("status", "UP");
        response.put("endpoint", "/ws");
        response.put("topic", "/topic/pod-updates");
        
        return ResponseEntity.ok(response);
    }
}
