package com.ticketbooking.service;

import com.ticketbooking.dto.ShowRequest;
import com.ticketbooking.dto.ShowResponse;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.entity.Screen;
import com.ticketbooking.entity.Show;
import com.ticketbooking.entity.ShowStatus;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.ShowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final MovieService movieService;
    private final ScreenService screenService;

    public ShowService(ShowRepository showRepository,
                       MovieService movieService,
                       ScreenService screenService) {
        this.showRepository = showRepository;
        this.movieService = movieService;
        this.screenService = screenService;
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> getFilteredShows(Long movieId, Long theatreId, LocalDate date) {
        LocalDateTime startTime = null;
        LocalDateTime endTime = null;

        if (date != null) {
            startTime = date.atStartOfDay();
            endTime = date.atTime(LocalTime.MAX);
        }

        List<Show> shows = showRepository.findFilteredShows(movieId, theatreId, startTime, endTime);
        return shows.stream().map(ShowResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShowResponse getShowById(Long id) {
        Show show = getShowEntity(id);
        return ShowResponse.fromEntity(show);
    }

    @Transactional(readOnly = true)
    public Show getShowEntity(Long id) {
        return showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));
    }

    @Transactional
    public ShowResponse createShow(ShowRequest request) {
        Movie movie = movieService.getMovieEntity(request.getMovieId());
        Screen screen = screenService.getScreenEntity(request.getScreenId());

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = request.getEndTime();

        // Auto-calculate end time based on movie duration + 15 min intermission/cleaning buffer
        if (end == null) {
            end = start.plusMinutes(movie.getDurationMinutes() + 15);
        }

        if (!end.isAfter(start)) {
            throw new BadRequestException("Show end time must be after start time");
        }

        // Conflict check: Overlapping shows on the same screen
        List<Show> conflicts = showRepository.findOverlappingShows(screen.getId(), start, end);
        if (!conflicts.isEmpty()) {
            Show c = conflicts.get(0);
            throw new BadRequestException(String.format(
                    "Conflict detected: Screen '%s' is already booked for another show from %s to %s",
                    screen.getName(), c.getStartTime(), c.getEndTime()
            ));
        }

        Show show = new Show(movie, screen, start, end, ShowStatus.SCHEDULED);
        Show saved = showRepository.save(show);
        return ShowResponse.fromEntity(saved);
    }

    @Transactional
    public ShowResponse updateShow(Long id, ShowRequest request) {
        Show show = getShowEntity(id);
        Movie movie = movieService.getMovieEntity(request.getMovieId());
        Screen screen = screenService.getScreenEntity(request.getScreenId());

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = request.getEndTime();

        if (end == null) {
            end = start.plusMinutes(movie.getDurationMinutes() + 15);
        }

        if (!end.isAfter(start)) {
            throw new BadRequestException("Show end time must be after start time");
        }

        // Conflict check excluding current show
        List<Show> conflicts = showRepository.findOverlappingShowsExcluding(screen.getId(), id, start, end);
        if (!conflicts.isEmpty()) {
            Show c = conflicts.get(0);
            throw new BadRequestException(String.format(
                    "Conflict detected: Screen '%s' is already booked for another show from %s to %s",
                    screen.getName(), c.getStartTime(), c.getEndTime()
            ));
        }

        show.setMovie(movie);
        show.setScreen(screen);
        show.setStartTime(start);
        show.setEndTime(end);

        Show updated = showRepository.save(show);
        return ShowResponse.fromEntity(updated);
    }

    @Transactional
    public ShowResponse cancelShow(Long id) {
        Show show = getShowEntity(id);
        show.setStatus(ShowStatus.CANCELLED);
        Show updated = showRepository.save(show);
        return ShowResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteShow(Long id) {
        Show show = getShowEntity(id);
        showRepository.delete(show);
    }
}
