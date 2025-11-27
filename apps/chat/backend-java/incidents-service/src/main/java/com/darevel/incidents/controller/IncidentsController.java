package com.darevel.incidents.controller;

import com.darevel.incidents.dto.Incident;
import com.darevel.incidents.service.IncidentsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IncidentsController {

    private final IncidentsService incidentsService;

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        Incident created = incidentsService.createIncident(incident);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity
    ) {
        List<Incident> incidents;
        if (status != null) {
            incidents = incidentsService.getIncidentsByStatus(status);
        } else if (severity != null) {
            incidents = incidentsService.getIncidentsBySeverity(severity);
        } else {
            incidents = incidentsService.getAllIncidents();
        }
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable String id) {
        return incidentsService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String resolvedBy = body.getOrDefault("resolvedBy", "system");
        String resolution = body.getOrDefault("resolution", "");

        return incidentsService.resolveIncident(id, resolvedBy, resolution)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/old")
    public ResponseEntity<Map<String, Object>> deleteOldIncidents(
            @RequestParam(defaultValue = "30") int days
    ) {
        int deleted = incidentsService.deleteOldIncidents(days);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("deleted", deleted);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = incidentsService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}
