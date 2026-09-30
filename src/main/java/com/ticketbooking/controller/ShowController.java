package com.ticketbooking.controller;

import com.ticketbooking.dto.ShowRequest;
import com.ticketbooking.dto.ShowResponse;
import com.ticketbooking.service.ShowService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;

    public ShowController(ShowService showService) {
        this.showService = showService;
    }

    @GetMapping
    public ResponseEntity<List<ShowResponse>> getShows(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long theatreId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(showService.getFilteredShows(movieId, theatreId, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowResponse> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowResponse> createShow(@Valid @RequestBody ShowRequest request) {
        ShowResponse response = showService.createShow(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowResponse> updateShow(
            @PathVariable Long id,
            @Valid @RequestBody ShowRequest request) {
        return ResponseEntity.ok(showService.updateShow(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowResponse> cancelShow(@PathVariable Long id) {
        return ResponseEntity.ok(showService.cancelShow(id));
    }
}
