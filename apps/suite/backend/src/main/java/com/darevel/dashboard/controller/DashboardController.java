package com.darevel.dashboard.controller;

import com.darevel.dashboard.dto.ApiResponse;
import com.darevel.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
        Map<String, Object> overview = dashboardService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/apps-status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAppsStatus() {
        Map<String, Object> status = dashboardService.getAppsStatus();
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
