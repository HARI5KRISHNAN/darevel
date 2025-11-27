package com.darevel.slides.controller;

import com.darevel.slides.dto.ApiResponse;
import com.darevel.slides.model.Slide;
import com.darevel.slides.service.SlideService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SlideController {

    private final SlideService slideService;

    @GetMapping("/presentations/{presentationId}/slides")
    public ResponseEntity<ApiResponse<List<Slide>>> getSlidesByPresentationId(
            @PathVariable Long presentationId) {
        List<Slide> slides = slideService.getSlidesByPresentationId(presentationId);
        return ResponseEntity.ok(ApiResponse.success(slides));
    }

    @GetMapping("/slides/{slideId}")
    public ResponseEntity<ApiResponse<Slide>> getSlideById(
            @PathVariable Long slideId,
            @RequestParam Long presentationId) {
        Slide slide = slideService.getSlideById(slideId, presentationId);
        return ResponseEntity.ok(ApiResponse.success(slide));
    }

    @PostMapping("/presentations/{presentationId}/slides")
    public ResponseEntity<ApiResponse<Slide>> createSlide(
            @PathVariable Long presentationId,
            @RequestBody Slide slide) {
        Slide created = slideService.createSlide(presentationId, slide);
        return ResponseEntity.ok(ApiResponse.success(created, "Slide created successfully"));
    }

    @PutMapping("/slides/{slideId}")
    public ResponseEntity<ApiResponse<Slide>> updateSlide(
            @PathVariable Long slideId,
            @RequestParam Long presentationId,
            @RequestBody Slide slide) {
        Slide updated = slideService.updateSlide(slideId, presentationId, slide);
        return ResponseEntity.ok(ApiResponse.success(updated, "Slide updated successfully"));
    }

    @DeleteMapping("/slides/{slideId}")
    public ResponseEntity<ApiResponse<Void>> deleteSlide(
            @PathVariable Long slideId,
            @RequestParam Long presentationId) {
        slideService.deleteSlide(slideId, presentationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Slide deleted successfully"));
    }

    @PostMapping("/slides/{slideId}/duplicate")
    public ResponseEntity<ApiResponse<Slide>> duplicateSlide(
            @PathVariable Long slideId,
            @RequestParam Long presentationId) {
        Slide duplicate = slideService.duplicateSlide(slideId, presentationId);
        return ResponseEntity.ok(ApiResponse.success(duplicate, "Slide duplicated successfully"));
    }

    @PutMapping("/presentations/{presentationId}/slides/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderSlides(
            @PathVariable Long presentationId,
            @RequestBody Map<String, List<Long>> request) {
        List<Long> slideIds = request.get("slideIds");
        slideService.reorderSlides(presentationId, slideIds);
        return ResponseEntity.ok(ApiResponse.success(null, "Slides reordered successfully"));
    }
}
