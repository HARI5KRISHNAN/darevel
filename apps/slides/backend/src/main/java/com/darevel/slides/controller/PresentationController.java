package com.darevel.slides.controller;

import com.darevel.slides.dto.ApiResponse;
import com.darevel.slides.model.Presentation;
import com.darevel.slides.service.PresentationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/presentations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PresentationController {

    private final PresentationService presentationService;

    private String getUserId(Jwt jwt) {
        return jwt.getSubject(); // Keycloak subject (user ID)
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Presentation>>> getAllPresentations(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        List<Presentation> presentations = presentationService.getAllPresentations(userId);
        return ResponseEntity.ok(ApiResponse.success(presentations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Presentation>> getPresentationById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        Presentation presentation = presentationService.getPresentationById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(presentation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Presentation>> createPresentation(
            @RequestBody Presentation presentation,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        presentation.setOwnerId(userId);
        presentation.setCreatedBy(jwt.getClaimAsString("email"));

        Presentation created = presentationService.createPresentation(presentation);
        return ResponseEntity.ok(ApiResponse.success(created, "Presentation created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Presentation>> updatePresentation(
            @PathVariable Long id,
            @RequestBody Presentation presentation,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        Presentation updated = presentationService.updatePresentation(id, userId, presentation);
        return ResponseEntity.ok(ApiResponse.success(updated, "Presentation updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePresentation(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        presentationService.deletePresentation(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Presentation deleted successfully"));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse<Presentation>> duplicatePresentation(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = getUserId(jwt);
        Presentation duplicate = presentationService.duplicatePresentation(id, userId);
        return ResponseEntity.ok(ApiResponse.success(duplicate, "Presentation duplicated successfully"));
    }
}
