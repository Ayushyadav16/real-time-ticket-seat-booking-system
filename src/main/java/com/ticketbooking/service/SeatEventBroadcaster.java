package com.ticketbooking.service;

import com.ticketbooking.dto.SeatUpdateEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatEventBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(SeatEventBroadcaster.class);
    private final SimpMessagingTemplate messagingTemplate;

    public SeatEventBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastSeatsLocked(Long showId, List<Long> seatIds, Long userId) {
        broadcast(showId, "LOCKED", seatIds, userId, null);
    }

    public void broadcastSeatsUnlocked(Long showId, List<Long> seatIds, Long userId) {
        broadcast(showId, "UNLOCKED", seatIds, userId, null);
    }

    public void broadcastSeatsBooked(Long showId, List<Long> seatIds, Long userId, String bookingReference) {
        broadcast(showId, "BOOKED", seatIds, userId, bookingReference);
    }

    public void broadcastSeatsReleased(Long showId, List<Long> seatIds, Long userId) {
        broadcast(showId, "RELEASED", seatIds, userId, null);
    }

    private void broadcast(Long showId, String action, List<Long> seatIds, Long userId, String bookingReference) {
        try {
            String destination = "/topic/shows/" + showId + "/seats";
            SeatUpdateEvent event = new SeatUpdateEvent(
                    action,
                    showId,
                    seatIds,
                    userId,
                    bookingReference,
                    LocalDateTime.now()
            );
            log.info("Broadcasting WebSocket seat event to {}: action={}, seats={}, user={}",
                    destination, action, seatIds, userId);
            messagingTemplate.convertAndSend(destination, event);
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket seat event for showId {}: {}", showId, e.getMessage());
        }
    }
}
