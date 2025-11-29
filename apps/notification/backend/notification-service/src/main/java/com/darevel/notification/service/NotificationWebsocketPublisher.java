package com.darevel.notification.service;

import com.darevel.notification.config.NotificationProperties;
import com.darevel.notification.domain.dto.NotificationResponse;
import java.util.UUID;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationWebsocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationProperties properties;

    public NotificationWebsocketPublisher(SimpMessagingTemplate messagingTemplate,
                                          NotificationProperties properties) {
        this.messagingTemplate = messagingTemplate;
        this.properties = properties;
    }

    public void publish(UUID userId, NotificationResponse payload) {
        String destination = properties.getWebsocket().getDestinationPrefix() + "/" + userId;
        messagingTemplate.convertAndSend(destination, payload);
    }
}
