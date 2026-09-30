package com.ticketbooking.service;

import com.ticketbooking.dto.MovieRequest;
import com.ticketbooking.dto.MovieResponse;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private MovieRepository movieRepository;

    @InjectMocks
    private MovieService movieService;

    private Movie movie;
    private MovieRequest movieRequest;

    @BeforeEach
    void setUp() {
        movie = new Movie(
                "Interstellar",
                "A space exploration movie",
                169,
                "English",
                LocalDate.of(2014, 11, 7),
                "https://example.com/poster.jpg"
        );
        movie.setId(1L);

        movieRequest = new MovieRequest(
                "Interstellar",
                "A space exploration movie",
                169,
                "English",
                LocalDate.of(2014, 11, 7),
                "https://example.com/poster.jpg"
        );
    }

    @Test
    void getAllMovies_WithoutSearch_ReturnsAll() {
        when(movieRepository.findAll()).thenReturn(List.of(movie));

        List<MovieResponse> result = movieService.getAllMovies(null);

        assertEquals(1, result.size());
        assertEquals("Interstellar", result.get(0).getTitle());
        verify(movieRepository, times(1)).findAll();
    }

    @Test
    void getAllMovies_WithSearch_ReturnsFiltered() {
        when(movieRepository.findByTitleContainingIgnoreCase("inter")).thenReturn(List.of(movie));

        List<MovieResponse> result = movieService.getAllMovies("inter");

        assertEquals(1, result.size());
        assertEquals("Interstellar", result.get(0).getTitle());
        verify(movieRepository, times(1)).findByTitleContainingIgnoreCase("inter");
    }

    @Test
    void getMovieById_Success() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));

        MovieResponse result = movieService.getMovieById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Interstellar", result.getTitle());
    }

    @Test
    void getMovieById_NotFound_ThrowsException() {
        when(movieRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> movieService.getMovieById(99L));
    }

    @Test
    void createMovie_Success() {
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);

        MovieResponse result = movieService.createMovie(movieRequest);

        assertNotNull(result);
        assertEquals("Interstellar", result.getTitle());
        verify(movieRepository, times(1)).save(any(Movie.class));
    }

    @Test
    void updateMovie_Success() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        when(movieRepository.save(any(Movie.class))).thenReturn(movie);

        MovieRequest updateRequest = new MovieRequest(
                "Interstellar Updated",
                "Updated description",
                175,
                "English",
                LocalDate.of(2014, 11, 7),
                "https://example.com/poster2.jpg"
        );

        MovieResponse result = movieService.updateMovie(1L, updateRequest);

        assertNotNull(result);
        assertEquals("Interstellar Updated", result.getTitle());
        verify(movieRepository, times(1)).save(movie);
    }

    @Test
    void deleteMovie_Success() {
        when(movieRepository.findById(1L)).thenReturn(Optional.of(movie));
        doNothing().when(movieRepository).delete(movie);

        movieService.deleteMovie(1L);

        verify(movieRepository, times(1)).delete(movie);
    }
}
