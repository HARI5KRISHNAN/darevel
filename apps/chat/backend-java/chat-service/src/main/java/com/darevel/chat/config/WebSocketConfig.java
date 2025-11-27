package com.darevel.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Expose topics and queues used by the application
        config.enableSimpleBroker(
            "/topic",
            "/queue",
            "/topic/messages",
            "/topic/call-signal"
        );

        // Prefix for messages destined to @MessageMapping handlers
        config.setApplicationDestinationPrefixes("/app");

        // If you use SimpUserDestinationResolver for user destinations:
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Raw WebSocket endpoint (use reverse proxy for TLS termination in prod)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");

        // SockJS fallback for older clients:
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
