package com.ticketbooking.kafka;

import com.ticketbooking.event.BookingCancelledEvent;
import com.ticketbooking.event.BookingCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @KafkaListener(topics = "${app.kafka.booking-topic:booking-events}", groupId = "notification-group", autoStartup = "false")
    public void onKafkaMessage(Object event) {
        if (event instanceof BookingCreatedEvent bce) {
            handleBookingCreatedNotification(bce);
        } else if (event instanceof BookingCancelledEvent bce) {
            handleBookingCancelledNotification(bce);
        }
    }

    public void handleBookingCreatedNotification(BookingCreatedEvent event) {
        log.info("════════════════════════════════════════════════════════════════");
        log.info("📧 [NOTIFICATION SERVICE - EMAIL / SMS DISPATCHED]");
        log.info("To: {} <{}>", event.getUserName(), event.getUserEmail());
        log.info("Subject: 🎟️ Your Booking Confirmation - {}", event.getBookingReference());
        log.info("Movie: '{}' at {}", event.getMovieTitle(), event.getTheatreName());
        log.info("Screen: {} | Showtime: {}", event.getScreenName(), event.getShowStartTime());
        log.info("Confirmed Seats: {} | Total Paid: ${}", event.getSeatLabels(), event.getTotalAmount());
        log.info("════════════════════════════════════════════════════════════════");
    }

    public void handleBookingCancelledNotification(BookingCancelledEvent event) {
        log.info("════════════════════════════════════════════════════════════════");
        log.info("📧 [NOTIFICATION SERVICE - CANCELLATION NOTICE]");
        log.info("Booking Reference: {}", event.getBookingReference());
        log.info("Status: CANCELLED | Refund Processed: ${}", event.getRefundAmount());
        log.info("════════════════════════════════════════════════════════════════");
    }
}
