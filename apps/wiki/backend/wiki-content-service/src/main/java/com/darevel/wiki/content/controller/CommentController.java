package com.darevel.wiki.content.controller;

import com.darevel.wiki.content.dto.AddCommentRequest;
import com.darevel.wiki.content.dto.BlockCommentResponse;
import com.darevel.wiki.content.dto.UpdateCommentRequest;
import com.darevel.wiki.content.service.CommentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wiki/content/comments")
@RequiredArgsConstructor
@Validated
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<BlockCommentResponse> addComment(@Valid @RequestBody AddCommentRequest request) {
        BlockCommentResponse response = commentService.addComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{pageId}")
    public List<BlockCommentResponse> getPageComments(@PathVariable UUID pageId) {
        return commentService.getPageComments(pageId);
    }

    @GetMapping("/{pageId}/blocks/{blockId}")
    public List<BlockCommentResponse> getBlockComments(
        @PathVariable UUID pageId,
        @PathVariable String blockId
    ) {
        return commentService.getBlockComments(pageId, blockId);
    }

    @GetMapping("/{pageId}/unresolved")
    public List<BlockCommentResponse> getUnresolvedComments(@PathVariable UUID pageId) {
        return commentService.getUnresolvedComments(pageId);
    }

    @PutMapping("/{commentId}")
    public BlockCommentResponse updateComment(
        @PathVariable UUID commentId,
        @Valid @RequestBody UpdateCommentRequest request
    ) {
        return commentService.updateComment(commentId, request.content(), request.userId());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
        @PathVariable UUID commentId,
        @RequestParam @NotNull UUID userId
    ) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{commentId}/resolve")
    public BlockCommentResponse resolveComment(
        @PathVariable UUID commentId,
        @RequestParam @NotNull UUID userId
    ) {
        return commentService.resolveComment(commentId, userId);
    }

    @PostMapping("/{commentId}/unresolve")
    public BlockCommentResponse unresolveComment(@PathVariable UUID commentId) {
        return commentService.unresolveComment(commentId);
    }
}
