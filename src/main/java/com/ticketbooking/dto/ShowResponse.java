package com.ticketbooking.dto;

import com.ticketbooking.entity.Show;
import com.ticketbooking.entity.ShowStatus;

import java.time.LocalDateTime;

public class ShowResponse {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private int movieDurationMinutes;
    private String movieLanguage;

    private Long theatreId;
    private String theatreName;
    private String theatreCity;
    private String theatreLocation;

    private Long screenId;
    private String screenName;
    private int screenCapacity;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ShowStatus status;
    private LocalDateTime createdAt;

    public ShowResponse() {
    }

    public static ShowResponse fromEntity(Show show) {
        if (show == null) return null;

        ShowResponse resp = new ShowResponse();
        resp.setId(show.getId());

        if (show.getMovie() != null) {
            resp.setMovieId(show.getMovie().getId());
            resp.setMovieTitle(show.getMovie().getTitle());
            resp.setMoviePosterUrl(show.getMovie().getPosterUrl());
            resp.setMovieDurationMinutes(show.getMovie().getDurationMinutes());
            resp.setMovieLanguage(show.getMovie().getLanguage());
        }

        if (show.getScreen() != null) {
            resp.setScreenId(show.getScreen().getId());
            resp.setScreenName(show.getScreen().getName());
            resp.setScreenCapacity(show.getScreen().getCapacity());

            if (show.getScreen().getTheatre() != null) {
                resp.setTheatreId(show.getScreen().getTheatre().getId());
                resp.setTheatreName(show.getScreen().getTheatre().getName());
                resp.setTheatreCity(show.getScreen().getTheatre().getCity());
                resp.setTheatreLocation(show.getScreen().getTheatre().getLocation());
            }
        }

        resp.setStartTime(show.getStartTime());
        resp.setEndTime(show.getEndTime());
        resp.setStatus(show.getStatus());
        resp.setCreatedAt(show.getCreatedAt());

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public String getMoviePosterUrl() {
        return moviePosterUrl;
    }

    public void setMoviePosterUrl(String moviePosterUrl) {
        this.moviePosterUrl = moviePosterUrl;
    }

    public int getMovieDurationMinutes() {
        return movieDurationMinutes;
    }

    public void setMovieDurationMinutes(int movieDurationMinutes) {
        this.movieDurationMinutes = movieDurationMinutes;
    }

    public String getMovieLanguage() {
        return movieLanguage;
    }

    public void setMovieLanguage(String movieLanguage) {
        this.movieLanguage = movieLanguage;
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

    public String getTheatreCity() {
        return theatreCity;
    }

    public void setTheatreCity(String theatreCity) {
        this.theatreCity = theatreCity;
    }

    public String getTheatreLocation() {
        return theatreLocation;
    }

    public void setTheatreLocation(String theatreLocation) {
        this.theatreLocation = theatreLocation;
    }

    public Long getScreenId() {
        return screenId;
    }

    public void setScreenId(Long screenId) {
        this.screenId = screenId;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
    }

    public int getScreenCapacity() {
        return screenCapacity;
    }

    public void setScreenCapacity(int screenCapacity) {
        this.screenCapacity = screenCapacity;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public ShowStatus getStatus() {
        return status;
    }

    public void setStatus(ShowStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
