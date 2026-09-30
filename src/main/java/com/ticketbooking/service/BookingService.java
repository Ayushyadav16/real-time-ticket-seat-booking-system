package com.ticketbooking.service;

import com.ticketbooking.dto.BookingRequest;
import com.ticketbooking.dto.BookingResponse;
import com.ticketbooking.entity.*;
import com.ticketbooking.event.BookingCancelledEvent;
import com.ticketbooking.event.BookingCreatedEvent;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.kafka.BookingEventPublisher;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.BookingSeatRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowService showService;
    private final SeatRepository seatRepository;
    private final SeatLockService seatLockService;
    private final SeatAvailabilityService seatAvailabilityService;
    private final BookingEventPublisher eventPublisher;

    public BookingService(BookingRepository bookingRepository,
                          BookingSeatRepository bookingSeatRepository,
                          UserRepository userRepository,
                          ShowService showService,
                          SeatRepository seatRepository,
                          SeatLockService seatLockService,
                          SeatAvailabilityService seatAvailabilityService,
                          BookingEventPublisher eventPublisher) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.userRepository = userRepository;
        this.showService = showService;
        this.seatRepository = seatRepository;
        this.seatLockService = seatLockService;
        this.seatAvailabilityService = seatAvailabilityService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Show show = showService.getShowEntity(request.getShowId());
        if (show.getStatus() == ShowStatus.CANCELLED) {
            throw new BadRequestException("Cannot book tickets for a cancelled show");
        }

        List<Long> seatIds = request.getSeatIds();
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("At least one seat must be selected");
        }

        // 1. Verify user holds active Redis locks for ALL requested seats
        for (Long seatId : seatIds) {
            Long lockOwner = seatLockService.getSeatLockOwner(show.getId(), seatId);
            if (lockOwner == null || !lockOwner.equals(userId)) {
                throw new BadRequestException("You do not hold an active lock for seat ID " + seatId +
                        ". Please select and lock seats before confirming.");
            }
        }

        // 2. Relational MySQL safety check: ensure no seat is already booked
        for (Long seatId : seatIds) {
            if (bookingSeatRepository.isSeatBookedForShow(show.getId(), seatId)) {
                throw new BadRequestException("Seat ID " + seatId + " is already permanently booked for this show.");
            }
        }

        // 3. Fetch physical seat entities
        List<Seat> physicalSeats = seatRepository.findAllById(seatIds);
        if (physicalSeats.size() != seatIds.size()) {
            throw new ResourceNotFoundException("One or more seat IDs could not be found");
        }

        // 4. Calculate total price
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<String> seatLabels = new ArrayList<>();
        for (Seat s : physicalSeats) {
            BigDecimal price = seatAvailabilityService.getSeatPrice(s.getSeatType());
            totalAmount = totalAmount.add(price);
            seatLabels.add(s.getRowLabel() + s.getSeatNumber());
        }

        // 5. Generate booking reference
        String bookingReference = "BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = new Booking(user, show, bookingReference, totalAmount, BookingStatus.CONFIRMED);

        for (Seat s : physicalSeats) {
            BigDecimal price = seatAvailabilityService.getSeatPrice(s.getSeatType());
            BookingSeat bs = new BookingSeat(booking, s, price);
            booking.getBookingSeats().add(bs);
        }

        // 6. Save in MySQL (permanent source of truth)
        Booking savedBooking = bookingRepository.save(booking);

        // 7. Remove temporary Redis locks now that permanent MySQL record exists
        seatLockService.unlockSeats(show.getId(), seatIds, userId);

        // 8. Publish Kafka event
        BookingCreatedEvent event = new BookingCreatedEvent(
                savedBooking.getId(),
                savedBooking.getBookingReference(),
                user.getId(),
                user.getEmail(),
                user.getName(),
                show.getId(),
                show.getMovie().getTitle(),
                show.getScreen().getTheatre().getName(),
                show.getScreen().getName(),
                show.getStartTime(),
                seatLabels,
                totalAmount
        );
        eventPublisher.publishBookingCreated(event);

        return BookingResponse.fromEntity(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookings.stream().map(BookingResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view this booking");
        }

        return BookingResponse.fromEntity(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getShow().getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot cancel booking for a show that has already started or ended");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        // Publish cancellation event
        BookingCancelledEvent event = new BookingCancelledEvent(
                updated.getId(),
                updated.getBookingReference(),
                booking.getUser().getId(),
                updated.getTotalAmount()
        );
        eventPublisher.publishBookingCancelled(event);

        return BookingResponse.fromEntity(updated);
    }
}
