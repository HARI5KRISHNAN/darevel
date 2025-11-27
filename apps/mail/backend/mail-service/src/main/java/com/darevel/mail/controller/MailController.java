package com.darevel.mail.controller;

import com.darevel.mail.dto.*;
import com.darevel.mail.service.DraftService;
import com.darevel.mail.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mail")
public class MailController {

    private static final Logger log = LoggerFactory.getLogger(MailController.class);

    @Autowired
    private MailService mailService;

    @Autowired
    private DraftService draftService;

    // For development, use a default user. In production, extract from Keycloak token
    private String getUsername(String authHeader) {
        // TODO: Implement Keycloak token parsing
        // For now, return a default user for development
        return "testuser";
    }

    @GetMapping("/inbox")
    public ResponseEntity<Map<String, Object>> getInbox(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        log.info("GET /inbox for user: {}", user);
        List<MailDTO> mails = mailService.getInbox(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sent")
    public ResponseEntity<Map<String, Object>> getSent(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        List<MailDTO> mails = mailService.getSent(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/spam")
    public ResponseEntity<Map<String, Object>> getSpam(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        List<MailDTO> mails = mailService.getSpam(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trash")
    public ResponseEntity<Map<String, Object>> getTrash(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        List<MailDTO> mails = mailService.getTrash(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/important")
    public ResponseEntity<Map<String, Object>> getImportant(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        List<MailDTO> mails = mailService.getImportant(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Object>> getCounts(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        log.info("GET /counts for user: {}", user);
        FolderCountsDTO counts = mailService.getCounts(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("counts", counts);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestParam(value = "q", defaultValue = "") String query) {
        String user = getUsername(auth);
        List<MailDTO> mails = mailService.search(user, query);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("rows", mails);
        return ResponseEntity.ok(response);
    }

    // ========== DRAFT ENDPOINTS ==========

    @GetMapping("/drafts")
    public ResponseEntity<Map<String, Object>> getDrafts(@RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        log.info("GET /drafts for user: {}", user);
        List<DraftDTO> drafts = draftService.getDrafts(user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("drafts", drafts);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/drafts/{id}")
    public ResponseEntity<Map<String, Object>> getDraftById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        return draftService.getDraftById(id, user)
                .map(draft -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("draft", draft);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Draft not found");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @PostMapping("/drafts")
    public ResponseEntity<Map<String, Object>> saveDraft(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String user = getUsername(auth);
        Long id = body.get("id") != null ? Long.valueOf(body.get("id").toString()) : null;
        List<String> to = (List<String>) body.get("to");
        List<String> cc = (List<String>) body.get("cc");
        String subject = (String) body.get("subject");
        String bodyText = (String) body.get("body");
        String draftType = (String) body.get("draftType");
        Long inReplyTo = body.get("inReplyTo") != null ? Long.valueOf(body.get("inReplyTo").toString()) : null;
        List<String> attachments = (List<String>) body.get("attachments");

        DraftDTO draft = draftService.saveDraft(user, id, to, cc, subject, bodyText, draftType, inReplyTo, attachments);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("draft", draft);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/drafts/{id}")
    public ResponseEntity<Map<String, Object>> deleteDraft(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        boolean deleted = draftService.deleteDraft(id, user);
        Map<String, Object> response = new HashMap<>();
        if (deleted) {
            response.put("ok", true);
            response.put("message", "Draft deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("ok", false);
            response.put("error", "Draft not found or access denied");
            return ResponseEntity.status(404).body(response);
        }
    }

    // ========== SINGLE MAIL ENDPOINTS ==========

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getMailById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        return mailService.getMailById(id, user)
                .map(mail -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("mail", mail);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Not found or forbidden");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendMail(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody SendMailRequest request) {
        String user = getUsername(auth);
        log.info("POST /send from user: {} to: {}", user, request.getTo());
        MailDTO sent = mailService.sendMail(user, request.getTo(), request.getSubject(), request.getText(), request.getHtml());
        Map<String, Object> response = new HashMap<>();
        response.put("ok", true);
        response.put("info", sent);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        log.info("PATCH /{}/read for user: {}", id, user);
        boolean success = mailService.markAsRead(id, user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", success);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/unread")
    public ResponseEntity<Map<String, Object>> markAsUnread(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        boolean success = mailService.markAsUnread(id, user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", success);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<Map<String, Object>> toggleStar(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String user = getUsername(auth);
        boolean isStarred = Boolean.TRUE.equals(body.get("isStarred"));
        boolean success = mailService.toggleStar(id, user, isStarred);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", success);
        response.put("isStarred", isStarred);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/move")
    public ResponseEntity<Map<String, Object>> moveToFolder(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String user = getUsername(auth);
        String toFolder = (String) body.get("to");
        if (toFolder == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "Missing target folder \"to\"");
            return ResponseEntity.badRequest().body(response);
        }
        return mailService.moveToFolder(id, user, toFolder)
                .map(mail -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", true);
                    response.put("mail", mail);
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ok", false);
                    response.put("error", "Email not found or forbidden");
                    return ResponseEntity.status(404).body(response);
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> softDelete(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        boolean success = mailService.softDelete(id, user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", success);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, Object>> permanentDelete(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        String user = getUsername(auth);
        boolean success = mailService.permanentDelete(id, user);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", success);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> bulkAction(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        String user = getUsername(auth);
        List<Integer> idsRaw = (List<Integer>) body.get("ids");
        List<Long> ids = idsRaw.stream().map(Long::valueOf).toList();
        String action = (String) body.get("action");
        String toFolder = (String) body.get("to");

        if (ids == null || ids.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("ok", false);
            response.put("error", "ids array is required");
            return ResponseEntity.badRequest().body(response);
        }

        int count = mailService.bulkAction(user, ids, action, toFolder);
        Map<String, Object> response = new HashMap<>();
        response.put("ok", count > 0);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}
