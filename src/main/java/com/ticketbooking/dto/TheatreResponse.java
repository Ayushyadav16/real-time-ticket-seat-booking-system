package com.ticketbooking.dto;

import com.ticketbooking.entity.Theatre;
import java.time.LocalDateTime;

public class TheatreResponse {

    private Long id;
    private String name;
    private String location;
    private String city;
    private int screenCount;
    private LocalDateTime createdAt;

    public TheatreResponse() {
    }

    public TheatreResponse(Long id, String name, String location, String city, int screenCount, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.city = city;
        this.screenCount = screenCount;
        this.createdAt = createdAt;
    }

    public static TheatreResponse fromEntity(Theatre theatre) {
        if (theatre == null) return null;
        int count = theatre.getScreens() != null ? theatre.getScreens().size() : 0;
        return new TheatreResponse(
                theatre.getId(),
                theatre.getName(),
                theatre.getLocation(),
                theatre.getCity(),
                count,
                theatre.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public int getScreenCount() {
        return screenCount;
    }

    public void setScreenCount(int screenCount) {
        this.screenCount = screenCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
