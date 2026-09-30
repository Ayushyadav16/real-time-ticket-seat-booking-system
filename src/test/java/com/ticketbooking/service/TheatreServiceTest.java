package com.ticketbooking.service;

import com.ticketbooking.dto.TheatreRequest;
import com.ticketbooking.dto.TheatreResponse;
import com.ticketbooking.entity.Theatre;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.TheatreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TheatreServiceTest {

    @Mock
    private TheatreRepository theatreRepository;

    @InjectMocks
    private TheatreService theatreService;

    private Theatre theatre;
    private TheatreRequest theatreRequest;

    @BeforeEach
    void setUp() {
        theatre = new Theatre("PVR Phoenix", "Lower Parel", "Mumbai");
        theatre.setId(1L);

        theatreRequest = new TheatreRequest("PVR Phoenix", "Lower Parel", "Mumbai");
    }

    @Test
    void getAllTheatres_WithoutCity_ReturnsAll() {
        when(theatreRepository.findAll()).thenReturn(List.of(theatre));

        List<TheatreResponse> result = theatreService.getAllTheatres(null);

        assertEquals(1, result.size());
        assertEquals("PVR Phoenix", result.get(0).getName());
        verify(theatreRepository, times(1)).findAll();
    }

    @Test
    void getAllTheatres_WithCity_ReturnsFiltered() {
        when(theatreRepository.findByCityIgnoreCase("Mumbai")).thenReturn(List.of(theatre));

        List<TheatreResponse> result = theatreService.getAllTheatres("Mumbai");

        assertEquals(1, result.size());
        assertEquals("Mumbai", result.get(0).getCity());
        verify(theatreRepository, times(1)).findByCityIgnoreCase("Mumbai");
    }

    @Test
    void getTheatreById_Success() {
        when(theatreRepository.findById(1L)).thenReturn(Optional.of(theatre));

        TheatreResponse result = theatreService.getTheatreById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("PVR Phoenix", result.getName());
    }

    @Test
    void getTheatreById_NotFound_ThrowsException() {
        when(theatreRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> theatreService.getTheatreById(99L));
    }

    @Test
    void createTheatre_Success() {
        when(theatreRepository.save(any(Theatre.class))).thenReturn(theatre);

        TheatreResponse result = theatreService.createTheatre(theatreRequest);

        assertNotNull(result);
        assertEquals("PVR Phoenix", result.getName());
        verify(theatreRepository, times(1)).save(any(Theatre.class));
    }

    @Test
    void deleteTheatre_Success() {
        when(theatreRepository.findById(1L)).thenReturn(Optional.of(theatre));
        doNothing().when(theatreRepository).delete(theatre);

        theatreService.deleteTheatre(1L);

        verify(theatreRepository, times(1)).delete(theatre);
    }
}
