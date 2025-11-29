package com.darevel.aiform.controller;

import com.darevel.aiform.dto.FormGenerationRequest;
import com.darevel.aiform.dto.FormGenerationResponse;
import com.darevel.aiform.service.AIFormGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai/forms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3002", "http://localhost:3005"})
public class AIFormController {

    private final AIFormGenerationService aiFormService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<FormGenerationResponse>> generateForm(
            @Valid @RequestBody FormGenerationRequest request) {
        
        return aiFormService.generateForm(request)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().build()));
    }

    @GetMapping("/suggestions")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<String[]>> getQuestionSuggestions(
            @RequestParam String context) {
        
        return aiFormService.generateQuestionSuggestions(context)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().build()));
    }
}
