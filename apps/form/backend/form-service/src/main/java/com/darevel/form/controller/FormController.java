package com.darevel.form.controller;

import com.darevel.form.dto.FormDTO;
import com.darevel.form.dto.FormDetailDTO;
import com.darevel.form.service.FormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3002", "http://localhost:3005"})
public class FormController {

    private final FormService formService;

    @PostMapping
    public ResponseEntity<FormDTO> createForm(
            @Valid @RequestBody FormDTO formDTO,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        FormDTO created = formService.createForm(formDTO, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<FormDTO>> getUserForms(
            Authentication authentication,
            Pageable pageable) {
        UUID userId = getUserIdFromAuth(authentication);
        Page<FormDTO> forms = formService.getUserForms(userId, pageable);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormDTO> getFormById(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        FormDTO form = formService.getFormById(id, userId);
        return ResponseEntity.ok(form);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<FormDetailDTO> getFormDetails(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        FormDetailDTO details = formService.getFormDetails(id, userId);
        return ResponseEntity.ok(details);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormDTO> updateForm(
            @PathVariable UUID id,
            @Valid @RequestBody FormDTO formDTO,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        FormDTO updated = formService.updateForm(id, formDTO, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        formService.deleteForm(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/public-link")
    public ResponseEntity<Map<String, String>> generatePublicLink(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = getUserIdFromAuth(authentication);
        String publicId = formService.generatePublicLink(id, userId);
        return ResponseEntity.ok(Map.of("publicId", publicId, 
                "publicUrl", "/f/" + publicId));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String sub = jwt.getSubject();
        return UUID.fromString(sub);
    }
}
