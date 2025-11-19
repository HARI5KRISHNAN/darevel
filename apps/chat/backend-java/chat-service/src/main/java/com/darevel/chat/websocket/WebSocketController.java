package com.darevel.chat.websocket;

import com.darevel.chat.dto.CallSignalDto;
import com.darevel.chat.dto.MessageDto;
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
     * Receive a chat message, persist it via ChatService, and broadcast to the channel topic.
     */
    @MessageMapping("/chat/{channelId}/send")
    public void sendMessage(
            @DestinationVariable String channelId,
            SendMessageRequest request) {

        log.info("💬 Message received for channel: {}", channelId);

        // Persist message (ChatService may handle encryption per your policy)
        MessageDto saved = chatService.sendMessage(channelId, request);

        // Broadcast to all subscribers of that channel
        String destination = "/topic/messages/" + channelId;
        messagingTemplate.convertAndSend(destination, saved);

        log.info("💬 Broadcasted message {} to {}", saved.getId(), destination);
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
