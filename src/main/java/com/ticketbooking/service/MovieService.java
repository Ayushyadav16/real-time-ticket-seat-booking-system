package com.ticketbooking.service;

import com.ticketbooking.dto.MovieRequest;
import com.ticketbooking.dto.MovieResponse;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.MovieRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies(String search) {
        List<Movie> movies;
        if (search != null && !search.trim().isEmpty()) {
            movies = movieRepository.findByTitleContainingIgnoreCase(search.trim());
        } else {
            movies = movieRepository.findAll();
        }
        return movies.stream().map(MovieResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = getMovieEntity(id);
        return MovieResponse.fromEntity(movie);
    }

    @Transactional(readOnly = true)
    public Movie getMovieEntity(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found with id: " + id));
    }

    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = new Movie(
                request.getTitle(),
                request.getDescription(),
                request.getDurationMinutes(),
                request.getLanguage(),
                request.getReleaseDate(),
                request.getPosterUrl()
        );
        Movie saved = movieRepository.save(movie);
        return MovieResponse.fromEntity(saved);
    }

    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = getMovieEntity(id);
        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setDurationMinutes(request.getDurationMinutes());
        movie.setLanguage(request.getLanguage());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setPosterUrl(request.getPosterUrl());

        Movie updated = movieRepository.save(movie);
        return MovieResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = getMovieEntity(id);
        movieRepository.delete(movie);
    }
}
