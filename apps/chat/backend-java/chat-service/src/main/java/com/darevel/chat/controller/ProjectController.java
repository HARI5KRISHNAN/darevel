package com.darevel.chat.controller;

import com.darevel.chat.dto.ProjectDTO;
import com.darevel.chat.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", projects);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getProjectsByUserId(@PathVariable("userId") Long userId) {
        try {
            List<ProjectDTO> projects = projectService.getProjectsByUserId(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", projects);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProjectById(@PathVariable("id") Long id) {
        return projectService.getProjectById(id)
                .map(project -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("data", project);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Project not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(@RequestBody ProjectDTO projectDTO) {
        try {
            ProjectDTO createdProject = projectService.createProject(projectDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", createdProject);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProject(@PathVariable("id") Long id, @RequestBody ProjectDTO projectDTO) {
        try {
            ProjectDTO updatedProject = projectService.updateProject(id, projectDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedProject);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteProject(@PathVariable("id") Long id) {
        try {
            projectService.deleteProject(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Project deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
