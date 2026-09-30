package com.ticketbooking.dto;

import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatType;

public class SeatResponse {

    private Long id;
    private Long screenId;
    private String rowLabel;
    private int seatNumber;
    private SeatType seatType;

    public SeatResponse() {
    }

    public SeatResponse(Long id, Long screenId, String rowLabel, int seatNumber, SeatType seatType) {
        this.id = id;
        this.screenId = screenId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
    }

    public static SeatResponse fromEntity(Seat seat) {
        if (seat == null) return null;
        Long sId = seat.getScreen() != null ? seat.getScreen().getId() : null;
        return new SeatResponse(
                seat.getId(),
                sId,
                seat.getRowLabel(),
                seat.getSeatNumber(),
                seat.getSeatType()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getScreenId() {
        return screenId;
    }

    public void setScreenId(Long screenId) {
        this.screenId = screenId;
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
}
