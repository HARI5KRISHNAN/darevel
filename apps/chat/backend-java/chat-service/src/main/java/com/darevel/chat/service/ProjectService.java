package com.darevel.chat.service;

import com.darevel.chat.dto.ProjectDTO;
import com.darevel.chat.model.Project;
import com.darevel.chat.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByUserId(Long userId) {
        return projectRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(project -> project.getMemberIds() != null && project.getMemberIds().contains(userId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ProjectDTO> getProjectById(Long id) {
        return projectRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDTO) {
        Project project = convertToEntity(projectDTO);
        Project savedProject = projectRepository.save(project);
        ProjectDTO result = convertToDTO(savedProject);
        broadcastProjectUpdate("created", result);
        return result;
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDTO) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        updateEntityFromDTO(project, projectDTO);
        Project updatedProject = projectRepository.save(project);
        ProjectDTO result = convertToDTO(updatedProject);
        broadcastProjectUpdate("updated", result);
        return result;
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
        // Broadcast deletion with just the ID
        Map<String, Object> deleteMessage = new HashMap<>();
        deleteMessage.put("type", "deleted");
        deleteMessage.put("projectId", id);
        messagingTemplate.convertAndSend("/topic/projects", deleteMessage);
    }

    /**
     * Broadcast project updates to all connected clients via WebSocket
     */
    private void broadcastProjectUpdate(String type, ProjectDTO project) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("project", project);
        messagingTemplate.convertAndSend("/topic/projects", message);
    }

    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setCategory(project.getCategory());
        dto.setCategoryTheme(project.getCategoryTheme());
        dto.setProgress(project.getProgress());
        dto.setStatus(project.getStatus());
        dto.setMemberIds(project.getMemberIds());
        dto.setTasks(project.getTasksJson());
        dto.setComments(project.getCommentsJson());
        dto.setFiles(project.getFilesJson());
        return dto;
    }

    private Project convertToEntity(ProjectDTO dto) {
        Project project = new Project();
        updateEntityFromDTO(project, dto);
        return project;
    }

    private void updateEntityFromDTO(Project project, ProjectDTO dto) {
        // Only update fields that are explicitly provided in the DTO
        if (dto.getTitle() != null) {
            project.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            project.setDescription(dto.getDescription());
        }
        if (dto.getCategory() != null) {
            project.setCategory(dto.getCategory());
        }
        if (dto.getCategoryTheme() != null) {
            project.setCategoryTheme(dto.getCategoryTheme());
        }
        if (dto.getProgress() != null) {
            project.setProgress(dto.getProgress());
        }
        if (dto.getStatus() != null) {
            project.setStatus(dto.getStatus());
        }
        if (dto.getMemberIds() != null) {
            project.setMemberIds(dto.getMemberIds());
        }
        if (dto.getTasks() != null) {
            project.setTasksJson(dto.getTasks());
        }
        if (dto.getComments() != null) {
            project.setCommentsJson(dto.getComments());
        }
        if (dto.getFiles() != null) {
            project.setFilesJson(dto.getFiles());
        }
    }
}
