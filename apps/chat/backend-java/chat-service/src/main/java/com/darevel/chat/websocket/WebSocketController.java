package com.darevel.chat.websocket;

import com.darevel.chat.dto.CallSignalDto;
import com.darevel.chat.dto.MessageDto;
import com.darevel.chat.dto.SendMessageRequest;
import com.darevel.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{channelId}/send")
    @SendTo("/topic/messages/{channelId}")
    public MessageDto sendMessage(
            @DestinationVariable String channelId,
            SendMessageRequest request) {
        log.info("💬 Message received for channel: {}", channelId);
        return chatService.sendMessage(channelId, request);
    }

    /**
     * Handle WebRTC call signaling messages
     * Receives from /app/call-signal/{toUserId}
     * Sends to /topic/call-signal/{toUserId}
     * 
     * Messages flow:
     * 1. Caller (Hari) sends: /app/call-signal/2 with payload containing signal
     * 2. This method receives it, extracts toUserId from path (2)
     * 3. Broadcasts to /topic/call-signal/2 for receiver (Ram) to listen
     */
    @MessageMapping("/call-signal/{toUserId}")
    @SendTo("/topic/call-signal/{toUserId}")
    public CallSignalDto handleCallSignal(
            @DestinationVariable Long toUserId,
            CallSignalDto signalMessage) {
        
        log.info("========================================");
        log.info("📞 CALL SIGNAL RECEIVED");
        log.info("========================================");
        log.info("📞 Receiver User ID (from path): {}", toUserId);
        log.info("📞 Signal Type: {}", signalMessage.getType());
        log.info("📞 From User: {}", signalMessage.getFrom());
        log.info("📞 To User: {}", signalMessage.getTo());
        log.info("📞 Channel: {}", signalMessage.getChannelId());
        log.info("📞 Call Type: {}", signalMessage.getCallType());
        log.info("📞 Has Offer: {}", signalMessage.getOffer() != null);
        log.info("📞 Has Answer: {}", signalMessage.getAnswer() != null);
        log.info("📞 Has ICE Candidate: {}", signalMessage.getCandidate() != null);
        log.info("========================================");
        log.info("📞 BROADCASTING to /topic/call-signal/{}", toUserId);
        log.info("========================================");
        
        // Verify the toUserId matches the signal's 'to' field
        if (!toUserId.equals(signalMessage.getTo())) {
            log.warn("⚠️  WARNING: Path toUserId {} doesn't match signal.to {}", 
                    toUserId, signalMessage.getTo());
        }
        
        // Simply relay the message to the recipient
        // Spring STOMP will automatically send this to /topic/call-signal/{toUserId}
        return signalMessage;
    }
}
