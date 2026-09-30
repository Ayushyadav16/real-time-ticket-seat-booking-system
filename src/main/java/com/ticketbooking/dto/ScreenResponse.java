package com.ticketbooking.dto;

import com.ticketbooking.entity.Screen;
import java.time.LocalDateTime;

public class ScreenResponse {

    private Long id;
    private Long theatreId;
    private String theatreName;
    private String name;
    private int capacity;
    private int seatCount;
    private LocalDateTime createdAt;

    public ScreenResponse() {
    }

    public ScreenResponse(Long id, Long theatreId, String theatreName, String name, int capacity, int seatCount, LocalDateTime createdAt) {
        this.id = id;
        this.theatreId = theatreId;
        this.theatreName = theatreName;
        this.name = name;
        this.capacity = capacity;
        this.seatCount = seatCount;
        this.createdAt = createdAt;
    }

    public static ScreenResponse fromEntity(Screen screen) {
        if (screen == null) return null;
        Long theatreId = screen.getTheatre() != null ? screen.getTheatre().getId() : null;
        String theatreName = screen.getTheatre() != null ? screen.getTheatre().getName() : null;
        int seatCount = screen.getSeats() != null ? screen.getSeats().size() : 0;
        return new ScreenResponse(
                screen.getId(),
                theatreId,
                theatreName,
                screen.getName(),
                screen.getCapacity(),
                seatCount,
                screen.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTheatreId() {
        return theatreId;
    }

    public void setTheatreId(Long theatreId) {
        this.theatreId = theatreId;
    }

    public String getTheatreName() {
        return theatreName;
    }

    public void setTheatreName(String theatreName) {
        this.theatreName = theatreName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public int getSeatCount() {
        return seatCount;
    }

    public void setSeatCount(int seatCount) {
        this.seatCount = seatCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
