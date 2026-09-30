package com.ticketbooking.dto;

import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BookingResponse {

    private Long id;
    private String bookingReference;
    private Long userId;
    private String userEmail;
    private String userName;

    private Long showId;
    private String movieTitle;
    private String moviePosterUrl;
    private String theatreName;
    private String theatreCity;
    private String theatreLocation;
    private String screenName;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private BookingStatus status;
    private BigDecimal totalAmount;
    private List<BookingSeatResponse> seats = new ArrayList<>();
    private LocalDateTime createdAt;

    public BookingResponse() {
    }

    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) return null;

        BookingResponse resp = new BookingResponse();
        resp.setId(booking.getId());
        resp.setBookingReference(booking.getBookingReference());
        resp.setStatus(booking.getStatus());
        resp.setTotalAmount(booking.getTotalAmount());
        resp.setCreatedAt(booking.getCreatedAt());

        if (booking.getUser() != null) {
            resp.setUserId(booking.getUser().getId());
            resp.setUserEmail(booking.getUser().getEmail());
            resp.setUserName(booking.getUser().getName());
        }

        if (booking.getShow() != null) {
            resp.setShowId(booking.getShow().getId());
            resp.setStartTime(booking.getShow().getStartTime());
            resp.setEndTime(booking.getShow().getEndTime());

            if (booking.getShow().getMovie() != null) {
                resp.setMovieTitle(booking.getShow().getMovie().getTitle());
                resp.setMoviePosterUrl(booking.getShow().getMovie().getPosterUrl());
            }

            if (booking.getShow().getScreen() != null) {
                resp.setScreenName(booking.getShow().getScreen().getName());
                if (booking.getShow().getScreen().getTheatre() != null) {
                    resp.setTheatreName(booking.getShow().getScreen().getTheatre().getName());
                    resp.setTheatreCity(booking.getShow().getScreen().getTheatre().getCity());
                    resp.setTheatreLocation(booking.getShow().getScreen().getTheatre().getLocation());
                }
            }
        }

        if (booking.getBookingSeats() != null) {
            resp.setSeats(booking.getBookingSeats().stream()
                    .map(BookingSeatResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
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

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
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

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<BookingSeatResponse> getSeats() {
        return seats;
    }

    public void setSeats(List<BookingSeatResponse> seats) {
        this.seats = seats;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
