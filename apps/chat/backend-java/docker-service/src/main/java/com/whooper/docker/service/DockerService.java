package com.whooper.docker.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.ListContainersCmd;
import com.github.dockerjava.api.model.Container;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.whooper.docker.dto.ContainerDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DockerService {
    
    private static final Logger logger = LoggerFactory.getLogger(DockerService.class);
    
    private DockerClient dockerClient;
    private DockerHttpClient httpClient;
    
    @PostConstruct
    public void init() {
        try {
            // Configure Docker client
            DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                    .build();
            
            // Create HTTP client
            httpClient = new ApacheDockerHttpClient.Builder()
                    .dockerHost(config.getDockerHost())
                    .sslConfig(config.getSSLConfig())
                    .maxConnections(100)
                    .connectionTimeout(Duration.ofSeconds(30))
                    .responseTimeout(Duration.ofSeconds(45))
                    .build();
            
            // Create Docker client
            dockerClient = DockerClientImpl.getInstance(config, httpClient);
            
            logger.info("Docker client initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize Docker client: {}", e.getMessage(), e);
        }
    }
    
    @PreDestroy
    public void cleanup() {
        try {
            if (httpClient != null) {
                httpClient.close();
            }
            logger.info("Docker client closed successfully");
        } catch (Exception e) {
            logger.error("Error closing Docker client: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get all Docker containers (running and stopped)
     */
    public List<ContainerDTO> getAllContainers() {
        try {
            if (dockerClient == null) {
                logger.warn("Docker client is not initialized");
                return new ArrayList<>();
            }
            
            // List all containers (including stopped ones)
            ListContainersCmd listContainersCmd = dockerClient.listContainersCmd()
                    .withShowAll(true);
            
            List<Container> containers = listContainersCmd.exec();
            
            logger.info("Found {} containers", containers.size());
            
            return containers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            logger.error("Error fetching containers: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Get only running Docker containers
     */
    public List<ContainerDTO> getRunningContainers() {
        try {
            if (dockerClient == null) {
                logger.warn("Docker client is not initialized");
                return new ArrayList<>();
            }
            
            List<Container> containers = dockerClient.listContainersCmd().exec();
            
            logger.info("Found {} running containers", containers.size());
            
            return containers.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            logger.error("Error fetching running containers: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Map Docker Container to ContainerDTO
     */
    private ContainerDTO mapToDTO(Container container) {
        ContainerDTO dto = new ContainerDTO();
        
        // Set ID (short version)
        dto.setId(container.getId().substring(0, Math.min(12, container.getId().length())));
        
        // Set name (remove leading slash if present)
        String name = container.getNames() != null && container.getNames().length > 0 
                ? container.getNames()[0] 
                : "unknown";
        dto.setName(name.startsWith("/") ? name.substring(1) : name);
        
        // Set image
        dto.setImage(container.getImage() != null ? container.getImage() : "unknown");
        
        // Set status
        dto.setStatus(container.getStatus() != null ? container.getStatus() : "unknown");
        
        // Set created time (Unix timestamp in seconds)
        dto.setCreatedTime(container.getCreated() != null ? container.getCreated() : 0L);
        
        // Get restart count from labels or state
        Integer restartCount = 0;
        try {
            if (container.getLabels() != null && container.getLabels().containsKey("restartCount")) {
                restartCount = Integer.parseInt(container.getLabels().get("restartCount"));
            }
        } catch (Exception e) {
            logger.debug("Could not parse restart count for container {}", dto.getName());
        }
        dto.setRestartCount(restartCount);
        
        // Mock CPU and memory usage (set to 0.0 as requested)
        dto.setCpuUsage(0.0);
        dto.setMemoryUsage(0.0);
        
        return dto;
    }
    
    /**
     * Get logs from a specific container
     * 
     * @param containerId The container ID (can be short or full ID)
     * @param tail Number of lines to return from the end of logs
     * @param timestamps Include timestamps in the logs
     * @return Container logs as a string
     */
    public String getContainerLogs(String containerId, Integer tail, boolean timestamps) {
        try {
            if (dockerClient == null) {
                logger.warn("Docker client is not initialized");
                return null;
            }
            
            logger.info("Fetching logs for container: {}", containerId);
            
            // Build log command
            StringBuilder logsBuilder = new StringBuilder();
            
            dockerClient.logContainerCmd(containerId)
                    .withStdOut(true)
                    .withStdErr(true)
                    .withTimestamps(timestamps)
                    .withTail(tail)
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<com.github.dockerjava.api.model.Frame>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Frame frame) {
                            if (frame != null && frame.getPayload() != null) {
                                logsBuilder.append(new String(frame.getPayload()));
                            }
                        }
                    })
                    .awaitCompletion(10, java.util.concurrent.TimeUnit.SECONDS);
            
            String logs = logsBuilder.toString();
            logger.info("Successfully fetched {} characters of logs for container {}", 
                       logs.length(), containerId);
            
            return logs;
            
        } catch (com.github.dockerjava.api.exception.NotFoundException e) {
            logger.warn("Container not found: {}", containerId);
            return null;
        } catch (Exception e) {
            logger.error("Error fetching logs for container {}: {}", containerId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch container logs", e);
        }
    }
    
    /**
     * Check if Docker daemon is accessible
     */
    public boolean isDockerAvailable() {
        try {
            if (dockerClient != null) {
                dockerClient.pingCmd().exec();
                return true;
            }
        } catch (Exception e) {
            logger.debug("Docker daemon is not accessible: {}", e.getMessage());
        }
        return false;
    }
}
