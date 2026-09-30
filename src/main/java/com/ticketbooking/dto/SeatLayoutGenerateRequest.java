package com.ticketbooking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class SeatLayoutGenerateRequest {

    @NotEmpty(message = "Row labels must not be empty")
    private List<String> rows;

    @Min(value = 1, message = "Seats per row must be at least 1")
    private int seatsPerRow;

    private List<String> premiumRows;

    private List<String> reclinerRows;

    public SeatLayoutGenerateRequest() {
    }

    public SeatLayoutGenerateRequest(List<String> rows, int seatsPerRow, List<String> premiumRows, List<String> reclinerRows) {
        this.rows = rows;
        this.seatsPerRow = seatsPerRow;
        this.premiumRows = premiumRows;
        this.reclinerRows = reclinerRows;
    }

    public List<String> getRows() {
        return rows;
    }

    public void setRows(List<String> rows) {
        this.rows = rows;
    }

    public int getSeatsPerRow() {
        return seatsPerRow;
    }

    public void setSeatsPerRow(int seatsPerRow) {
        this.seatsPerRow = seatsPerRow;
    }

    public List<String> getPremiumRows() {
        return premiumRows;
    }

    public void setPremiumRows(List<String> premiumRows) {
        this.premiumRows = premiumRows;
    }

    public List<String> getReclinerRows() {
        return reclinerRows;
    }

    public void setReclinerRows(List<String> reclinerRows) {
        this.reclinerRows = reclinerRows;
    }
}
