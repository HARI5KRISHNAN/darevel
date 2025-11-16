package com.darevel.chat.websocket;

import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat/{channelId}/send")
    @SendTo("/topic/messages/{channelId}")
    public MessageDto sendMessage(
            @DestinationVariable String channelId,
            SendMessageRequest request) {
        return chatService.sendMessage(channelId, request);
    }

    /**
     * Handle WebRTC call signaling messages
     * Messages are sent to /app/call-signal/{toUserId}
     * And broadcast to /topic/call-signal/{toUserId}
     */
    @MessageMapping("/call-signal/{toUserId}")
    @SendTo("/topic/call-signal/{toUserId}")
    public Object handleCallSignal(
            @DestinationVariable Long toUserId,
            Object signalMessage) {
        log.info("Relaying call signal to user: {}", toUserId);
        // Simply relay the message to the recipient
        return signalMessage;
    }
}
