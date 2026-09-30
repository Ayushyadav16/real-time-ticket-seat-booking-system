package com.ticketbooking.config;

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
        // Destination prefix for subscriptions (clients listen to /topic/shows/{showId}/seats)
        config.enableSimpleBroker("/topic");
        // Prefix for messages routed from client to message-handling methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback for browsers without pure WebSocket support
        registry.addEndpoint("/ws-booking")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Native WebSocket endpoint for direct STOMP connections
        registry.addEndpoint("/ws-booking")
                .setAllowedOriginPatterns("*");
    }
}
