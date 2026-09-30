package com.ticketbooking.kafka;

import com.ticketbooking.event.BookingCancelledEvent;
import com.ticketbooking.event.BookingCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

@Component
public class AnalyticsConsumer {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsConsumer.class);

    private final AtomicInteger totalBookingsCount = new AtomicInteger(0);
    private final AtomicInteger totalSeatsBookedCount = new AtomicInteger(0);
    private final AtomicReference<BigDecimal> totalRevenue = new AtomicReference<>(BigDecimal.ZERO);

    @KafkaListener(topics = "${app.kafka.booking-topic:booking-events}", groupId = "analytics-group", autoStartup = "false")
    public void onKafkaMessage(Object event) {
        if (event instanceof BookingCreatedEvent bce) {
            handleBookingCreatedAnalytics(bce);
        } else if (event instanceof BookingCancelledEvent bce) {
            handleBookingCancelledAnalytics(bce);
        }
    }

    public void handleBookingCreatedAnalytics(BookingCreatedEvent event) {
        int bookings = totalBookingsCount.incrementAndGet();
        int seatsCount = event.getSeatLabels() != null ? event.getSeatLabels().size() : 0;
        int totalSeats = totalSeatsBookedCount.addAndGet(seatsCount);

        BigDecimal revenue = totalRevenue.updateAndGet(prev -> prev.add(event.getTotalAmount()));

        log.info("📊 [ANALYTICS CONSUMER - METRICS UPDATED]");
        log.info("Event Booking: {} | Added Revenue: +${}", event.getBookingReference(), event.getTotalAmount());
        log.info("System Aggregates -> Total Bookings: {} | Total Tickets: {} | Cumulative Revenue: ${}",
                bookings, totalSeats, revenue);
    }

    public void handleBookingCancelledAnalytics(BookingCancelledEvent event) {
        BigDecimal revenue = totalRevenue.updateAndGet(prev -> prev.subtract(event.getRefundAmount()));
        log.info("📊 [ANALYTICS CONSUMER - CANCELLATION UPDATED]");
        log.info("Refund Deducted: -${} | Adjusted Cumulative Revenue: ${}", event.getRefundAmount(), revenue);
    }

    public int getTotalBookingsCount() {
        return totalBookingsCount.get();
    }

    public int getTotalSeatsBookedCount() {
        return totalSeatsBookedCount.get();
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue.get();
    }
}
