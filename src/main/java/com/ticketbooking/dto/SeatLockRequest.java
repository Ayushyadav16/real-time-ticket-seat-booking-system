package com.ticketbooking.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class SeatLockRequest {

    @NotEmpty(message = "Seat IDs cannot be empty")
    private List<Long> seatIds;

    public SeatLockRequest() {
    }

    public SeatLockRequest(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }
}
