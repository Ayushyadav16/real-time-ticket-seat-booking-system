package com.ticketbooking.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Value("${app.kafka.booking-topic:booking-events}")
    private String bookingTopic;

    @Bean
    public NewTopic bookingTopic() {
        return TopicBuilder.name(bookingTopic)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
