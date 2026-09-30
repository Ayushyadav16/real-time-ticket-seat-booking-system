package com.ticketbooking.kafka;

import com.ticketbooking.event.BookingCancelledEvent;
import com.ticketbooking.event.BookingCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class BookingEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(BookingEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final NotificationConsumer notificationConsumer;
    private final AnalyticsConsumer analyticsConsumer;

    @Value("${app.kafka.booking-topic:booking-events}")
    private String bookingTopic;

    @Autowired
    public BookingEventPublisher(
            @Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate,
            NotificationConsumer notificationConsumer,
            AnalyticsConsumer analyticsConsumer) {
        this.kafkaTemplate = kafkaTemplate;
        this.notificationConsumer = notificationConsumer;
        this.analyticsConsumer = analyticsConsumer;
    }

    public void publishBookingCreated(BookingCreatedEvent event) {
        log.info("📢 Publishing BookingCreatedEvent for reference: {}", event.getBookingReference());

        // 1. Attempt publishing to Apache Kafka topic
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(bookingTopic, event.getBookingReference(), event)
                        .whenComplete((result, ex) -> {
                            if (ex != null) {
                                log.warn("Kafka broker unreachable ({}), event processed by internal subscribers.", ex.getMessage());
                            } else {
                                log.info("Kafka: Successfully delivered event to topic '{}' partition {}",
                                        bookingTopic, result.getRecordMetadata().partition());
                            }
                        });
            } catch (Exception e) {
                log.warn("Could not dispatch to Kafka broker: {}. Delivering locally.", e.getMessage());
            }
        }

        // 2. Invoke local event consumers asynchronously / safely
        try {
            notificationConsumer.handleBookingCreatedNotification(event);
            analyticsConsumer.handleBookingCreatedAnalytics(event);
        } catch (Exception e) {
            log.error("Error in event subscriber: ", e);
        }
    }

    public void publishBookingCancelled(BookingCancelledEvent event) {
        log.info("📢 Publishing BookingCancelledEvent for reference: {}", event.getBookingReference());

        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(bookingTopic, event.getBookingReference(), event);
            } catch (Exception e) {
                log.warn("Kafka broker unavailable for cancellation: {}", e.getMessage());
            }
        }

        try {
            notificationConsumer.handleBookingCancelledNotification(event);
            analyticsConsumer.handleBookingCancelledAnalytics(event);
        } catch (Exception e) {
            log.error("Error in cancellation subscriber: ", e);
        }
    }
}
