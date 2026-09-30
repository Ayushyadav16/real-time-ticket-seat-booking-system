package com.ticketbooking.service;

import com.ticketbooking.dto.SeatUpdateEvent;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SeatEventBroadcasterTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private SeatEventBroadcaster broadcaster;

    @Test
    void testBroadcastSeatsLocked() {
        Long showId = 1L;
        List<Long> seatIds = List.of(10L, 11L);
        Long userId = 42L;

        broadcaster.broadcastSeatsLocked(showId, seatIds, userId);

        ArgumentCaptor<SeatUpdateEvent> captor = ArgumentCaptor.forClass(SeatUpdateEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/shows/1/seats"), captor.capture());

        SeatUpdateEvent captured = captor.getValue();
        assertEquals("LOCKED", captured.getAction());
        assertEquals(showId, captured.getShowId());
        assertEquals(seatIds, captured.getSeatIds());
        assertEquals(userId, captured.getUserId());
        assertNotNull(captured.getTimestamp());
    }

    @Test
    void testBroadcastSeatsUnlocked() {
        Long showId = 2L;
        List<Long> seatIds = List.of(12L);
        Long userId = 42L;

        broadcaster.broadcastSeatsUnlocked(showId, seatIds, userId);

        ArgumentCaptor<SeatUpdateEvent> captor = ArgumentCaptor.forClass(SeatUpdateEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/shows/2/seats"), captor.capture());

        SeatUpdateEvent captured = captor.getValue();
        assertEquals("UNLOCKED", captured.getAction());
        assertEquals(showId, captured.getShowId());
    }

    @Test
    void testBroadcastSeatsBooked() {
        Long showId = 3L;
        List<Long> seatIds = List.of(15L, 16L);
        Long userId = 99L;
        String ref = "BKG-12345678";

        broadcaster.broadcastSeatsBooked(showId, seatIds, userId, ref);

        ArgumentCaptor<SeatUpdateEvent> captor = ArgumentCaptor.forClass(SeatUpdateEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/shows/3/seats"), captor.capture());

        SeatUpdateEvent captured = captor.getValue();
        assertEquals("BOOKED", captured.getAction());
        assertEquals(ref, captured.getBookingReference());
    }

    @Test
    void testBroadcastSeatsReleased() {
        Long showId = 4L;
        List<Long> seatIds = List.of(20L);
        Long userId = 99L;

        broadcaster.broadcastSeatsReleased(showId, seatIds, userId);

        ArgumentCaptor<SeatUpdateEvent> captor = ArgumentCaptor.forClass(SeatUpdateEvent.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/shows/4/seats"), captor.capture());

        SeatUpdateEvent captured = captor.getValue();
        assertEquals("RELEASED", captured.getAction());
    }
}
