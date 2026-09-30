package com.ticketbooking.service;

import com.ticketbooking.dto.ShowRequest;
import com.ticketbooking.dto.ShowResponse;
import com.ticketbooking.entity.*;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.ShowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShowServiceTest {

    @Mock
    private ShowRepository showRepository;

    @Mock
    private MovieService movieService;

    @Mock
    private ScreenService screenService;

    @InjectMocks
    private ShowService showService;

    private Movie movie;
    private Screen screen;
    private Theatre theatre;
    private Show show;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @BeforeEach
    void setUp() {
        movie = new Movie("Inception", "Sci-fi", 148, "English", LocalDate.of(2010, 7, 16), null);
        movie.setId(1L);

        theatre = new Theatre("PVR", "Lower Parel", "Mumbai");
        theatre.setId(1L);

        screen = new Screen(theatre, "Screen 1", 50);
        screen.setId(1L);

        startTime = LocalDateTime.of(2026, 4, 1, 10, 0);
        endTime = LocalDateTime.of(2026, 4, 1, 12, 43); // 148 + 15 = 163 mins

        show = new Show(movie, screen, startTime, endTime, ShowStatus.SCHEDULED);
        show.setId(1L);
    }

    @Test
    void createShow_Success_WithAutoCalculatedEndTime() {
        when(movieService.getMovieEntity(1L)).thenReturn(movie);
        when(screenService.getScreenEntity(1L)).thenReturn(screen);
        when(showRepository.findOverlappingShows(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(Collections.emptyList());
        when(showRepository.save(any(Show.class))).thenReturn(show);

        ShowRequest request = new ShowRequest(1L, 1L, startTime, null);
        ShowResponse response = showService.createShow(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Inception", response.getMovieTitle());
        assertEquals("Screen 1", response.getScreenName());
        verify(showRepository, times(1)).save(any(Show.class));
    }

    @Test
    void createShow_OverlapConflict_ThrowsBadRequestException() {
        when(movieService.getMovieEntity(1L)).thenReturn(movie);
        when(screenService.getScreenEntity(1L)).thenReturn(screen);

        Show existingShow = new Show(movie, screen, startTime, endTime);
        when(showRepository.findOverlappingShows(eq(1L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(existingShow));

        ShowRequest request = new ShowRequest(1L, 1L, startTime, endTime);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> showService.createShow(request));
        assertTrue(ex.getMessage().contains("Conflict detected"));
        verify(showRepository, never()).save(any(Show.class));
    }

    @Test
    void createShow_EndTimeBeforeStartTime_ThrowsBadRequestException() {
        when(movieService.getMovieEntity(1L)).thenReturn(movie);
        when(screenService.getScreenEntity(1L)).thenReturn(screen);

        ShowRequest request = new ShowRequest(1L, 1L, startTime, startTime.minusMinutes(30));

        assertThrows(BadRequestException.class, () -> showService.createShow(request));
        verify(showRepository, never()).save(any(Show.class));
    }

    @Test
    void getShowById_Success() {
        when(showRepository.findById(1L)).thenReturn(Optional.of(show));

        ShowResponse response = showService.getShowById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Inception", response.getMovieTitle());
    }

    @Test
    void getShowById_NotFound_ThrowsResourceNotFoundException() {
        when(showRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> showService.getShowById(99L));
    }

    @Test
    void cancelShow_Success() {
        when(showRepository.findById(1L)).thenReturn(Optional.of(show));
        when(showRepository.save(any(Show.class))).thenReturn(show);

        ShowResponse response = showService.cancelShow(1L);

        assertNotNull(response);
        assertEquals(ShowStatus.CANCELLED, show.getStatus());
        verify(showRepository, times(1)).save(show);
    }

    @Test
    void getFilteredShows_Success() {
        when(showRepository.findFilteredShows(eq(1L), eq(1L), any(), any()))
                .thenReturn(List.of(show));

        List<ShowResponse> results = showService.getFilteredShows(1L, 1L, LocalDate.of(2026, 4, 1));

        assertEquals(1, results.size());
        assertEquals("Inception", results.get(0).getMovieTitle());
    }
}
