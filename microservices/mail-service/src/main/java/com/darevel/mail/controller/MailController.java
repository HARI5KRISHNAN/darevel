package com.darevel.mail.controller;

import com.darevel.common.dto.ApiResponse;
import com.darevel.mail.dto.ComposeEmailRequest;
import com.darevel.mail.dto.EmailDTO;
import com.darevel.mail.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;

    /**
     * GET /api/mail/inbox
     * Get inbox emails
     */
    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> getInbox(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.getInbox(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }

    /**
     * GET /api/mail/sent
     * Get sent emails
     */
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> getSent(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.getSent(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }

    /**
     * GET /api/mail/drafts
     * Get draft emails
     */
    @GetMapping("/drafts")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> getDrafts(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.getDrafts(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }

    /**
     * GET /api/mail/starred
     * Get starred emails
     */
    @GetMapping("/starred")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> getStarred(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.getStarred(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }

    /**
     * GET /api/mail/trash
     * Get trash emails
     */
    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> getTrash(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.getTrash(jwt, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }

    /**
     * GET /api/mail/{id}
     * Get email by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailDTO>> getEmailById(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        EmailDTO email = mailService.getEmailById(jwt, id);
        return ResponseEntity.ok(ApiResponse.success(email));
    }

    /**
     * POST /api/mail/compose
     * Compose or send email
     */
    @PostMapping("/compose")
    public ResponseEntity<ApiResponse<EmailDTO>> composeEmail(
            Authentication authentication,
            @RequestBody ComposeEmailRequest request) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        EmailDTO email = mailService.composeEmail(jwt, request);
        return ResponseEntity.ok(ApiResponse.success(
                email.getIsDraft() ? "Draft saved" : "Email sent", email));
    }

    /**
     * PATCH /api/mail/{id}
     * Update email (mark as read, starred, deleted)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailDTO>> updateEmail(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody EmailDTO updateDTO) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        EmailDTO email = mailService.updateEmail(jwt, id, updateDTO);
        return ResponseEntity.ok(ApiResponse.success("Email updated", email));
    }

    /**
     * DELETE /api/mail/{id}
     * Delete email permanently
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmail(
            Authentication authentication,
            @PathVariable Long id) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        mailService.deleteEmail(jwt, id);
        return ResponseEntity.ok(ApiResponse.success("Email deleted permanently", null));
    }

    /**
     * GET /api/mail/unread-count
     * Get unread email count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long count = mailService.getUnreadCount(jwt);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * GET /api/mail/search
     * Search emails
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<EmailDTO>>> searchEmails(
            Authentication authentication,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<EmailDTO> emails = mailService.searchEmails(jwt, q, page, size);
        return ResponseEntity.ok(ApiResponse.success(emails));
    }
}
