package com.darevel.docs.controller;

import com.darevel.docs.dto.CommentRequest;
import com.darevel.docs.dto.CommentResponse;
import com.darevel.docs.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/docs/documents/{documentId}/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable UUID documentId,
            @Valid @RequestBody CommentRequest request) {
        log.info("Creating comment on document: {}", documentId);
        CommentResponse response = commentService.createComment(documentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable UUID documentId) {
        log.info("Getting comments for document: {}", documentId);
        List<CommentResponse> comments = commentService.getComments(documentId);
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable UUID documentId,
            @PathVariable UUID commentId,
            @Valid @RequestBody CommentRequest request) {
        log.info("Updating comment: {}", commentId);
        CommentResponse response = commentService.updateComment(commentId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID documentId,
            @PathVariable UUID commentId) {
        log.info("Deleting comment: {}", commentId);
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/resolve")
    public ResponseEntity<CommentResponse> resolveComment(
            @PathVariable UUID documentId,
            @PathVariable UUID commentId) {
        log.info("Resolving comment: {}", commentId);
        CommentResponse response = commentService.resolveComment(commentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{commentId}/reopen")
    public ResponseEntity<CommentResponse> reopenComment(
            @PathVariable UUID documentId,
            @PathVariable UUID commentId) {
        log.info("Reopening comment: {}", commentId);
        CommentResponse response = commentService.reopenComment(commentId);
        return ResponseEntity.ok(response);
    }
}
