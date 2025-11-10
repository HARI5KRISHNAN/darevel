package com.darevel.chat.controller;

import com.darevel.chat.dto.MessageDTO;
import com.darevel.chat.service.ChatService;
import com.darevel.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageDTO>> sendMessage(
            Authentication authentication,
            @RequestBody MessageDTO messageDTO) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        MessageDTO message = chatService.sendMessage(jwt, messageDTO);
        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<ApiResponse<Page<MessageDTO>>> getConversation(
            Authentication authentication,
            @PathVariable String otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Page<MessageDTO> messages = chatService.getConversation(jwt, otherUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        Long count = chatService.getUnreadCount(jwt);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
