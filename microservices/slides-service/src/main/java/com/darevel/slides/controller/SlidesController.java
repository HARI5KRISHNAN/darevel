package com.darevel.slides.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.slides.dto.PresentationDTO;
import com.darevel.slides.service.SlidesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slides")
@RequiredArgsConstructor
public class SlidesController {

    private final SlidesService slidesService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PresentationDTO>>> getPresentations(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        List<PresentationDTO> presentations = slidesService.getPresentations(jwt);
        return ResponseEntity.ok(ApiResponse.success(presentations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PresentationDTO>> getPresentation(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        PresentationDTO presentation = slidesService.getPresentationById(jwt, id);
        return ResponseEntity.ok(ApiResponse.success(presentation));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PresentationDTO>> createPresentation(
            Authentication authentication,
            @RequestBody PresentationDTO dto) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        PresentationDTO presentation = slidesService.createPresentation(jwt, dto);
        return ResponseEntity.ok(ApiResponse.success("Presentation created", presentation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PresentationDTO>> updatePresentation(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody PresentationDTO dto) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        PresentationDTO presentation = slidesService.updatePresentation(jwt, id, dto);
        return ResponseEntity.ok(ApiResponse.success("Presentation updated", presentation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePresentation(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        slidesService.deletePresentation(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Presentation deleted", null));
    }
}
