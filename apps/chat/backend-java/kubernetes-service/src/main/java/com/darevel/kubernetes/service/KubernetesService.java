package com.darevel.kubernetes.service;

import com.darevel.kubernetes.dto.*;
import io.kubernetes.client.openapi.ApiException;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KubernetesService {

    private final CoreV1Api coreV1Api;
    private final SimpMessagingTemplate messagingTemplate;
    private boolean watchingEnabled = false;

    /**
     * List all pods across all namespaces
     */
    public List<PodInfo> listPods(String namespace) {
        try {
            V1PodList podList;
            if (namespace != null && !namespace.isEmpty()) {
                podList = coreV1Api.listNamespacedPod(namespace, null, null, null, null, null, null, null, null, null, null);
            } else {
                podList = coreV1Api.listPodForAllNamespaces(null, null, null, null, null, null, null, null, null, null);
            }

            return podList.getItems().stream()
                    .map(this::convertPodToPodInfo)
                    .collect(Collectors.toList());
        } catch (ApiException e) {
            log.error("Error listing pods", e);
            throw new RuntimeException("Failed to list pods: " + e.getResponseBody(), e);
        }
    }

    /**
     * Get a specific pod by name and namespace
     */
    public PodInfo getPod(String namespace, String name) {
        try {
            V1Pod pod = coreV1Api.readNamespacedPod(name, namespace, null);
            return convertPodToPodInfo(pod);
        } catch (ApiException e) {
            log.error("Error getting pod {}/{}", namespace, name, e);
            throw new RuntimeException("Failed to get pod: " + e.getResponseBody(), e);
        }
    }

    /**
     * Start watching pods and broadcasting updates via WebSocket
     */
    public void startWatching() {
        watchingEnabled = true;
        log.info("Pod watching enabled - updates will be broadcast every 10 seconds");
    }

    /**
     * Stop watching pods
     */
    public void stopWatching() {
        watchingEnabled = false;
        log.info("Pod watching disabled");
    }

    /**
     * Scheduled task to broadcast pod updates every 10 seconds
     */
    @Scheduled(fixedDelay = 10000)
    public void broadcastPodUpdates() {
        if (!watchingEnabled) {
            return;
        }

        try {
            List<PodInfo> pods = listPods(null);
            messagingTemplate.convertAndSend("/topic/pods", pods);
            log.debug("Broadcast pod updates: {} pods", pods.size());
        } catch (Exception e) {
            log.error("Error broadcasting pod updates", e);
        }
    }

    /**
     * Convert Kubernetes V1Pod to PodInfo DTO
     */
    private PodInfo convertPodToPodInfo(V1Pod pod) {
        V1PodStatus status = pod.getStatus();
        V1PodSpec spec = pod.getSpec();
        V1ObjectMeta metadata = pod.getMetadata();

        // Extract container information
        List<ContainerInfo> containers = new ArrayList<>();
        if (spec != null && spec.getContainers() != null) {
            for (int i = 0; i < spec.getContainers().size(); i++) {
                V1Container container = spec.getContainers().get(i);
                V1ContainerStatus containerStatus = null;

                if (status != null && status.getContainerStatuses() != null && i < status.getContainerStatuses().size()) {
                    containerStatus = status.getContainerStatuses().get(i);
                }

                containers.add(convertContainerToContainerInfo(container, containerStatus));
            }
        }

        // Extract conditions
        List<PodCondition> conditions = new ArrayList<>();
        if (status != null && status.getConditions() != null) {
            conditions = status.getConditions().stream()
                    .map(this::convertCondition)
                    .collect(Collectors.toList());
        }

        // Calculate total restart count
        int totalRestarts = 0;
        if (status != null && status.getContainerStatuses() != null) {
            totalRestarts = status.getContainerStatuses().stream()
                    .mapToInt(cs -> cs.getRestartCount() != null ? cs.getRestartCount() : 0)
                    .sum();
        }

        // Build metrics (placeholder - real metrics require metrics-server API)
        PodMetrics metrics = buildMetrics(spec);

        return PodInfo.builder()
                .name(metadata != null ? metadata.getName() : "unknown")
                .namespace(metadata != null ? metadata.getNamespace() : "unknown")
                .status(status != null && status.getPhase() != null ? status.getPhase() : "Unknown")
                .phase(status != null && status.getPhase() != null ? status.getPhase() : "Unknown")
                .containers(containers)
                .labels(metadata != null && metadata.getLabels() != null ? metadata.getLabels() : new HashMap<>())
                .nodeName(spec != null ? spec.getNodeName() : null)
                .podIP(status != null ? status.getPodIP() : null)
                .createdAt(metadata != null && metadata.getCreationTimestamp() != null
                        ? metadata.getCreationTimestamp().toString() : null)
                .restartCount(totalRestarts)
                .metrics(metrics)
                .conditions(conditions)
                .build();
    }

    private ContainerInfo convertContainerToContainerInfo(V1Container container, V1ContainerStatus status) {
        String state = "Unknown";
        String reason = null;
        String message = null;
        Integer restartCount = 0;
        Boolean ready = false;

        if (status != null) {
            ready = status.getReady();
            restartCount = status.getRestartCount();

            V1ContainerState containerState = status.getState();
            if (containerState != null) {
                if (containerState.getRunning() != null) {
                    state = "Running";
                } else if (containerState.getWaiting() != null) {
                    state = "Waiting";
                    reason = containerState.getWaiting().getReason();
                    message = containerState.getWaiting().getMessage();
                } else if (containerState.getTerminated() != null) {
                    state = "Terminated";
                    reason = containerState.getTerminated().getReason();
                    message = containerState.getTerminated().getMessage();
                }
            }
        }

        return ContainerInfo.builder()
                .name(container.getName())
                .image(container.getImage())
                .state(state)
                .restartCount(restartCount)
                .ready(ready)
                .reason(reason)
                .message(message)
                .build();
    }

    private PodCondition convertCondition(V1PodCondition condition) {
        return PodCondition.builder()
                .type(condition.getType())
                .status(condition.getStatus())
                .reason(condition.getReason())
                .message(condition.getMessage())
                .lastTransitionTime(condition.getLastTransitionTime() != null
                        ? condition.getLastTransitionTime().toString() : null)
                .build();
    }

    private PodMetrics buildMetrics(V1PodSpec spec) {
        // Placeholder for metrics - real implementation would query metrics-server
        // For now, we'll extract resource limits/requests from pod spec
        String cpuLimit = "N/A";
        String memoryLimit = "N/A";
        String cpuRequest = "N/A";
        String memoryRequest = "N/A";

        if (spec != null && spec.getContainers() != null && !spec.getContainers().isEmpty()) {
            V1Container firstContainer = spec.getContainers().get(0);
            V1ResourceRequirements resources = firstContainer.getResources();

            if (resources != null) {
                if (resources.getLimits() != null) {
                    if (resources.getLimits().containsKey("cpu")) {
                        cpuLimit = resources.getLimits().get("cpu").toSuffixedString();
                    }
                    if (resources.getLimits().containsKey("memory")) {
                        memoryLimit = resources.getLimits().get("memory").toSuffixedString();
                    }
                }
                if (resources.getRequests() != null) {
                    if (resources.getRequests().containsKey("cpu")) {
                        cpuRequest = resources.getRequests().get("cpu").toSuffixedString();
                    }
                    if (resources.getRequests().containsKey("memory")) {
                        memoryRequest = resources.getRequests().get("memory").toSuffixedString();
                    }
                }
            }
        }

        return PodMetrics.builder()
                .cpuUsage(cpuRequest)
                .memoryUsage(memoryRequest)
                .cpuLimit(cpuLimit)
                .memoryLimit(memoryLimit)
                .cpuPercentage(0.0)
                .memoryPercentage(0.0)
                .build();
    }
}
