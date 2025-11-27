package com.darevel.kubernetes.controller;

import com.darevel.kubernetes.dto.PodInfo;
import com.darevel.kubernetes.service.KubernetesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/pods")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KubernetesController {

    private final KubernetesService kubernetesService;

    /**
     * List all pods or pods in a specific namespace
     * GET /api/pods/list?namespace=default
     */
    @GetMapping("/list")
    public ResponseEntity<List<PodInfo>> listPods(
            @RequestParam(required = false) String namespace
    ) {
        try {
            log.info("Listing pods for namespace: {}", namespace != null ? namespace : "all");
            List<PodInfo> pods = kubernetesService.listPods(namespace);
            return ResponseEntity.ok(pods);
        } catch (Exception e) {
            log.error("Error listing pods", e);
            throw new RuntimeException("Failed to list pods: " + e.getMessage(), e);
        }
    }

    /**
     * Get a specific pod
     * GET /api/pods/{namespace}/{name}
     */
    @GetMapping("/{namespace}/{name}")
    public ResponseEntity<PodInfo> getPod(
            @PathVariable String namespace,
            @PathVariable String name
    ) {
        try {
            log.info("Getting pod {}/{}", namespace, name);
            PodInfo pod = kubernetesService.getPod(namespace, name);
            return ResponseEntity.ok(pod);
        } catch (Exception e) {
            log.error("Error getting pod {}/{}", namespace, name, e);
            throw new RuntimeException("Failed to get pod: " + e.getMessage(), e);
        }
    }

    /**
     * Start watching pods for real-time updates
     * POST /api/pods/watch/start
     */
    @PostMapping("/watch/start")
    public ResponseEntity<Map<String, Object>> startWatching() {
        try {
            log.info("Starting pod watching");
            kubernetesService.startWatching();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pod watching started");
            response.put("updateInterval", "10s");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error starting pod watch", e);
            throw new RuntimeException("Failed to start watching: " + e.getMessage(), e);
        }
    }

    /**
     * Stop watching pods
     * POST /api/pods/watch/stop
     */
    @PostMapping("/watch/stop")
    public ResponseEntity<Map<String, Object>> stopWatching() {
        try {
            log.info("Stopping pod watching");
            kubernetesService.stopWatching();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pod watching stopped");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error stopping pod watch", e);
            throw new RuntimeException("Failed to stop watching: " + e.getMessage(), e);
        }
    }
}
