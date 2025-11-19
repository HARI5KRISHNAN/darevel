package com.darevel.chat.websocket;

import com.darevel.chat.dto.CallSignalDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Receive a chat message and persist it via ChatService.
     * ChatService handles both persistence and broadcasting to avoid duplication.
     */
    @MessageMapping("/chat/{channelId}/send")
    public void sendMessage(
            @DestinationVariable String channelId,
            SendMessageRequest request) {

        log.info("💬 Message received for channel: {}", channelId);

        // Persist AND broadcast (ChatService will broadcast)
        chatService.sendMessage(channelId, request);

        // NO convertAndSend() here to avoid duplicate broadcast
    }

    /**
     * Relay WebRTC call signaling messages.
     * Clients send to /app/call-signal/{toUserId}
     * Server relays to /topic/call-signal/{toUserId}
     */
    @MessageMapping("/call-signal/{toUserId}")
    public void handleCallSignal(
            @DestinationVariable Long toUserId,
            CallSignalDto signalMessage) {

        log.info("📞 CALL SIGNAL RECEIVED for toUserId={}", toUserId);

        if (!toUserId.equals(signalMessage.getTo())) {
            log.warn("⚠️  Path toUserId {} doesn't match signal.to {}", toUserId, signalMessage.getTo());
        }

        String destination = "/topic/call-signal/" + toUserId;
        messagingTemplate.convertAndSend(destination, signalMessage);

        log.info("📞 Relayed call signal to {}", destination);
    }
}
