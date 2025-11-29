package com.darevel.publiclink.controller;

import com.darevel.publiclink.dto.FormPublicDTO;
import com.darevel.publiclink.dto.SubmissionDTO;
import com.darevel.publiclink.service.PublicFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/public/forms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicFormController {

    private final PublicFormService publicFormService;

    @GetMapping("/{publicId}")
    public Mono<ResponseEntity<FormPublicDTO>> getPublicForm(@PathVariable String publicId) {
        return publicFormService.getPublicForm(publicId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/{publicId}/submit")
    public Mono<ResponseEntity<String>> submitForm(
            @PathVariable String publicId,
            @Valid @RequestBody SubmissionDTO submission,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {
        
        return publicFormService.submitResponse(publicId, submission, ipAddress)
                .map(id -> ResponseEntity.ok("Submission successful: " + id))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())));
    }
}
