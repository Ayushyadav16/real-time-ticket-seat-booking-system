package com.ticketbooking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatUpdateEvent {

    private String action; // LOCKED, UNLOCKED, BOOKED, RELEASED
    private Long showId;
    private List<Long> seatIds;
    private Long userId;
    private String bookingReference;
    private LocalDateTime timestamp;

    public SeatUpdateEvent() {
    }

    public SeatUpdateEvent(String action, Long showId, List<Long> seatIds, Long userId, String bookingReference, LocalDateTime timestamp) {
        this.action = action;
        this.showId = showId;
        this.seatIds = seatIds;
        this.userId = userId;
        this.bookingReference = bookingReference;
        this.timestamp = timestamp;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
