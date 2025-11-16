package com.darevel.chat.websocket;

import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat/{channelId}/send")
    @SendTo("/topic/messages/{channelId}")
    public MessageDto sendMessage(
            @DestinationVariable String channelId,
            SendMessageRequest request) {
        return chatService.sendMessage(channelId, request);
    }
}
