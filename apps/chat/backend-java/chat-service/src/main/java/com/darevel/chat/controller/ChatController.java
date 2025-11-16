package com.darevel.chat.controller;

import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.service.ChatService;
import com.darevel.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/{channelId}/messages")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getMessages(@PathVariable String channelId) {
        List<MessageDto> messages = chatService.getMessages(channelId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/{channelId}/messages")
    public ResponseEntity<ApiResponse<MessageDto>> sendMessage(
            @PathVariable String channelId,
            @Valid @RequestBody SendMessageRequest request) {
        try {
            MessageDto message = chatService.sendMessage(channelId, request);
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/messages")
    public ResponseEntity<ApiResponse<Void>> clearAllMessages() {
        chatService.clearAllMessages();
        return ResponseEntity.ok(ApiResponse.success("All messages deleted successfully", null));
    }

    @DeleteMapping("/{channelId}/messages")
    public ResponseEntity<ApiResponse<Void>> clearChannelMessages(@PathVariable String channelId) {
        chatService.clearChannelMessages(channelId);
        return ResponseEntity.ok(ApiResponse.success("Channel messages deleted successfully", null));
    }
}
