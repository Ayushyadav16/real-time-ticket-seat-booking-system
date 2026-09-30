package com.ticketbooking.service;

import com.ticketbooking.dto.SeatLockResponse;
import com.ticketbooking.dto.ShowSeatResponse;
import com.ticketbooking.entity.*;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.repository.BookingSeatRepository;
import com.ticketbooking.repository.SeatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatAvailabilityServiceTest {

    @Mock
    private ShowService showService;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private SeatLockService seatLockService;

    @Mock
    private SeatEventBroadcaster seatEventBroadcaster;

    @InjectMocks
    private SeatAvailabilityService seatAvailabilityService;

    private Show show;
    private Screen screen;
    private Seat seat1;
    private Seat seat2;
    private Seat seat3;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(seatAvailabilityService, "lockTtlSeconds", 300L);

        screen = new Screen();
        screen.setId(1L);

        show = new Show();
        show.setId(10L);
        show.setScreen(screen);
        show.setStatus(ShowStatus.SCHEDULED);

        seat1 = new Seat(screen, "A", 1, SeatType.REGULAR);
        seat1.setId(101L);

        seat2 = new Seat(screen, "A", 2, SeatType.PREMIUM);
        seat2.setId(102L);

        seat3 = new Seat(screen, "A", 3, SeatType.RECLINER);
        seat3.setId(103L);
    }

    @Test
    void getSeatsForShow_CalculatesAvailableLockedAndBookedStates() {
        when(showService.getShowEntity(10L)).thenReturn(show);
        when(seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(1L)).thenReturn(List.of(seat1, seat2, seat3));
        when(bookingSeatRepository.findBookedSeatIdsForShow(10L)).thenReturn(Set.of(101L)); // Seat 101 is permanently booked in MySQL

        // Seat 102 is temporarily locked in Redis by user 50
        when(seatLockService.getSeatLockOwner(10L, 102L)).thenReturn(50L);
        when(seatLockService.getRemainingTtlSeconds(10L, 102L)).thenReturn(240L);

        // Seat 103 has no lock
        when(seatLockService.getSeatLockOwner(10L, 103L)).thenReturn(null);

        List<ShowSeatResponse> responses = seatAvailabilityService.getSeatsForShow(10L, 50L);

        assertEquals(3, responses.size());

        // Seat 101: BOOKED
        assertEquals(SeatStatus.BOOKED, responses.get(0).getStatus());
        assertFalse(responses.get(0).isLockedByCurrentUser());

        // Seat 102: LOCKED by current user (50)
        assertEquals(SeatStatus.LOCKED, responses.get(1).getStatus());
        assertTrue(responses.get(1).isLockedByCurrentUser());
        assertEquals(240L, responses.get(1).getLockExpiresInSeconds());

        // Seat 103: AVAILABLE
        assertEquals(SeatStatus.AVAILABLE, responses.get(2).getStatus());
        assertFalse(responses.get(2).isLockedByCurrentUser());
    }

    @Test
    void lockSeats_Success_MultiSeats() {
        when(showService.getShowEntity(10L)).thenReturn(show);
        when(seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(1L)).thenReturn(List.of(seat1, seat2, seat3));
        when(bookingSeatRepository.findBookedSeatIdsForShow(10L)).thenReturn(Set.of());
        when(seatLockService.lockSeats(eq(10L), eq(List.of(102L, 103L)), eq(50L), eq(300L))).thenReturn(true);

        SeatLockResponse response = seatAvailabilityService.lockSeats(10L, List.of(102L, 103L), 50L);

        assertNotNull(response);
        assertEquals(10L, response.getShowId());
        assertEquals(2, response.getLockedSeatIds().size());
        assertEquals(300L, response.getTtlSeconds());
        verify(seatLockService, times(1)).lockSeats(eq(10L), eq(List.of(102L, 103L)), eq(50L), eq(300L));
    }

    @Test
    void lockSeats_AlreadyPermanentlyBooked_ThrowsBadRequestException() {
        when(showService.getShowEntity(10L)).thenReturn(show);
        when(seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(1L)).thenReturn(List.of(seat1, seat2, seat3));
        when(bookingSeatRepository.findBookedSeatIdsForShow(10L)).thenReturn(Set.of(101L));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> seatAvailabilityService.lockSeats(10L, List.of(101L), 50L));

        assertTrue(ex.getMessage().contains("already permanently booked"));
        verify(seatLockService, never()).lockSeats(any(), any(), any(), anyLong());
    }

    @Test
    void lockSeats_RedisLockFailed_ThrowsBadRequestException() {
        when(showService.getShowEntity(10L)).thenReturn(show);
        when(seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(1L)).thenReturn(List.of(seat1, seat2, seat3));
        when(bookingSeatRepository.findBookedSeatIdsForShow(10L)).thenReturn(Set.of());
        when(seatLockService.lockSeats(eq(10L), eq(List.of(102L)), eq(50L), eq(300L))).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> seatAvailabilityService.lockSeats(10L, List.of(102L), 50L));

        assertTrue(ex.getMessage().contains("currently locked by another customer"));
    }

    @Test
    void unlockSeats_Success() {
        seatAvailabilityService.unlockSeats(10L, List.of(102L), 50L);

        verify(seatLockService, times(1)).unlockSeats(10L, List.of(102L), 50L);
    }
}
