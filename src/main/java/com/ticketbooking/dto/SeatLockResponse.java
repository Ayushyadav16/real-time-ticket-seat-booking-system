package com.ticketbooking.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatLockResponse {

    private Long showId;
    private List<Long> lockedSeatIds;
    private long ttlSeconds;
    private LocalDateTime expiresAt;
    private String message;

    public SeatLockResponse() {
    }

    public SeatLockResponse(Long showId, List<Long> lockedSeatIds, long ttlSeconds, LocalDateTime expiresAt, String message) {
        this.showId = showId;
        this.lockedSeatIds = lockedSeatIds;
        this.ttlSeconds = ttlSeconds;
        this.expiresAt = expiresAt;
        this.message = message;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public List<Long> getLockedSeatIds() {
        return lockedSeatIds;
    }

    public void setLockedSeatIds(List<Long> lockedSeatIds) {
        this.lockedSeatIds = lockedSeatIds;
    }

    public long getTtlSeconds() {
        return ttlSeconds;
    }

    public void setTtlSeconds(long ttlSeconds) {
        this.ttlSeconds = ttlSeconds;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
