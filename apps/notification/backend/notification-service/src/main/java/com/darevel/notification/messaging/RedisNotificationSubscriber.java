package com.darevel.notification.messaging;

import com.darevel.notification.service.NotificationProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Component
public class RedisNotificationSubscriber implements MessageListener {

    private static final Logger log = LoggerFactory.getLogger(RedisNotificationSubscriber.class);

    private final NotificationProcessor processor;

    public RedisNotificationSubscriber(NotificationProcessor processor) {
        this.processor = processor;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String payload = new String(message.getBody());
        log.debug("Received Redis event on pattern {}: {}", pattern != null ? new String(pattern) : "", payload);
        processor.handleRawPayload(payload);
    }
}
