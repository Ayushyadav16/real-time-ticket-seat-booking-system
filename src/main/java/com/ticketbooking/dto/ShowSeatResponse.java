package com.ticketbooking.dto;

import com.ticketbooking.entity.SeatStatus;
import com.ticketbooking.entity.SeatType;

import java.math.BigDecimal;

public class ShowSeatResponse {

    private Long seatId;
    private String rowLabel;
    private int seatNumber;
    private SeatType seatType;
    private SeatStatus status;
    private BigDecimal price;
    private boolean lockedByCurrentUser;
    private Long lockExpiresInSeconds;

    public ShowSeatResponse() {
    }

    public ShowSeatResponse(Long seatId, String rowLabel, int seatNumber, SeatType seatType,
                            SeatStatus status, BigDecimal price, boolean lockedByCurrentUser,
                            Long lockExpiresInSeconds) {
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.status = status;
        this.price = price;
        this.lockedByCurrentUser = lockedByCurrentUser;
        this.lockExpiresInSeconds = lockExpiresInSeconds;
    }

    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public void setRowLabel(String rowLabel) {
        this.rowLabel = rowLabel;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(int seatNumber) {
        this.seatNumber = seatNumber;
    }

    public SeatType getSeatType() {
        return seatType;
    }

    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status) {
        this.status = status;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isLockedByCurrentUser() {
        return lockedByCurrentUser;
    }

    public void setLockedByCurrentUser(boolean lockedByCurrentUser) {
        this.lockedByCurrentUser = lockedByCurrentUser;
    }

    public Long getLockExpiresInSeconds() {
        return lockExpiresInSeconds;
    }

    public void setLockExpiresInSeconds(Long lockExpiresInSeconds) {
        this.lockExpiresInSeconds = lockExpiresInSeconds;
    }
}
