package com.ticketbooking.dto;

import com.ticketbooking.entity.BookingSeat;
import com.ticketbooking.entity.SeatType;

import java.math.BigDecimal;

public class BookingSeatResponse {

    private Long seatId;
    private String rowLabel;
    private int seatNumber;
    private SeatType seatType;
    private BigDecimal price;

    public BookingSeatResponse() {
    }

    public BookingSeatResponse(Long seatId, String rowLabel, int seatNumber, SeatType seatType, BigDecimal price) {
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.price = price;
    }

    public static BookingSeatResponse fromEntity(BookingSeat bs) {
        if (bs == null || bs.getSeat() == null) return null;
        return new BookingSeatResponse(
                bs.getSeat().getId(),
                bs.getSeat().getRowLabel(),
                bs.getSeat().getSeatNumber(),
                bs.getSeat().getSeatType(),
                bs.getPrice()
        );
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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
