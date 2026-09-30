package com.ticketbooking.service;

import com.ticketbooking.dto.BookingRequest;
import com.ticketbooking.dto.BookingResponse;
import com.ticketbooking.entity.*;
import com.ticketbooking.event.BookingCreatedEvent;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.kafka.BookingEventPublisher;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.BookingSeatRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShowService showService;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private SeatLockService seatLockService;

    @Mock
    private SeatAvailabilityService seatAvailabilityService;

    @Mock
    private BookingEventPublisher eventPublisher;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Movie movie;
    private Theatre theatre;
    private Screen screen;
    private Show show;
    private Seat seat1;
    private Seat seat2;

    @BeforeEach
    void setUp() {
        user = new User("Alice", "alice@example.com", "pass", Role.CUSTOMER);
        user.setId(10L);

        movie = new Movie();
        movie.setTitle("Inception");

        theatre = new Theatre("PVR", "Lower Parel", "Mumbai");
        theatre.setId(1L);

        screen = new Screen(theatre, "Screen 1", 50);
        screen.setId(1L);

        show = new Show(movie, screen, LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(1).plusHours(2));
        show.setId(5L);

        seat1 = new Seat(screen, "A", 1, SeatType.REGULAR);
        seat1.setId(101L);

        seat2 = new Seat(screen, "A", 2, SeatType.PREMIUM);
        seat2.setId(102L);
    }

    @Test
    void createBooking_Success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(showService.getShowEntity(5L)).thenReturn(show);

        // User holds active locks
        when(seatLockService.getSeatLockOwner(5L, 101L)).thenReturn(10L);
        when(seatLockService.getSeatLockOwner(5L, 102L)).thenReturn(10L);

        // Not booked in MySQL
        when(bookingSeatRepository.isSeatBookedForShow(5L, 101L)).thenReturn(false);
        when(bookingSeatRepository.isSeatBookedForShow(5L, 102L)).thenReturn(false);

        when(seatRepository.findAllById(List.of(101L, 102L))).thenReturn(List.of(seat1, seat2));
        when(seatAvailabilityService.getSeatPrice(SeatType.REGULAR)).thenReturn(new BigDecimal("12.00"));
        when(seatAvailabilityService.getSeatPrice(SeatType.PREMIUM)).thenReturn(new BigDecimal("18.00"));

        Booking saved = new Booking(user, show, "BKG-12345678", new BigDecimal("30.00"), BookingStatus.CONFIRMED);
        saved.setId(1L);
        when(bookingRepository.save(any(Booking.class))).thenReturn(saved);

        BookingRequest request = new BookingRequest(5L, List.of(101L, 102L));
        BookingResponse response = bookingService.createBooking(request, 10L);

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals(new BigDecimal("30.00"), response.getTotalAmount());

        // Verify temporary locks released
        verify(seatLockService, times(1)).unlockSeats(5L, List.of(101L, 102L), 10L);

        // Verify Kafka event published
        verify(eventPublisher, times(1)).publishBookingCreated(any(BookingCreatedEvent.class));
    }

    @Test
    void createBooking_UserDoesNotHoldLock_ThrowsBadRequestException() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(showService.getShowEntity(5L)).thenReturn(show);

        // Seat 101 lock owned by someone else or expired
        when(seatLockService.getSeatLockOwner(5L, 101L)).thenReturn(99L);

        BookingRequest request = new BookingRequest(5L, List.of(101L));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(request, 10L));

        assertTrue(ex.getMessage().contains("do not hold an active lock"));
        verify(bookingRepository, never()).save(any());
        verify(eventPublisher, never()).publishBookingCreated(any());
    }

    @Test
    void createBooking_SeatAlreadyBookedInMySQL_ThrowsBadRequestException() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(showService.getShowEntity(5L)).thenReturn(show);

        when(seatLockService.getSeatLockOwner(5L, 101L)).thenReturn(10L);
        when(bookingSeatRepository.isSeatBookedForShow(5L, 101L)).thenReturn(true);

        BookingRequest request = new BookingRequest(5L, List.of(101L));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(request, 10L));

        assertTrue(ex.getMessage().contains("already permanently booked"));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_Success() {
        Booking booking = new Booking(user, show, "BKG-12345678", new BigDecimal("30.00"), BookingStatus.CONFIRMED);
        booking.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse response = bookingService.cancelBooking(1L, 10L, false);

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(eventPublisher, times(1)).publishBookingCancelled(any());
    }

    @Test
    void cancelBooking_NotOwner_ThrowsBadRequestException() {
        Booking booking = new Booking(user, show, "BKG-12345678", new BigDecimal("30.00"), BookingStatus.CONFIRMED);
        booking.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class,
                () -> bookingService.cancelBooking(1L, 99L, false));

        verify(eventPublisher, never()).publishBookingCancelled(any());
    }
}
