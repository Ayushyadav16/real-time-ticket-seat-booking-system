package com.ticketbooking.dto;

import com.ticketbooking.entity.Movie;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private int durationMinutes;
    private String language;
    private LocalDate releaseDate;
    private String posterUrl;
    private LocalDateTime createdAt;

    public MovieResponse() {
    }

    public MovieResponse(Long id, String title, String description, int durationMinutes, String language, LocalDate releaseDate, String posterUrl, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.language = language;
        this.releaseDate = releaseDate;
        this.posterUrl = posterUrl;
        this.createdAt = createdAt;
    }

    public static MovieResponse fromEntity(Movie movie) {
        if (movie == null) return null;
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getDurationMinutes(),
                movie.getLanguage(),
                movie.getReleaseDate(),
                movie.getPosterUrl(),
                movie.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
