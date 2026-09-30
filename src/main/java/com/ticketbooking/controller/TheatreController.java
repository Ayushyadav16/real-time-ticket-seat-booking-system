package com.ticketbooking.controller;

import com.ticketbooking.dto.ScreenRequest;
import com.ticketbooking.dto.ScreenResponse;
import com.ticketbooking.dto.TheatreRequest;
import com.ticketbooking.dto.TheatreResponse;
import com.ticketbooking.service.ScreenService;
import com.ticketbooking.service.TheatreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/theatres")
public class TheatreController {

    private final TheatreService theatreService;
    private final ScreenService screenService;

    public TheatreController(TheatreService theatreService, ScreenService screenService) {
        this.theatreService = theatreService;
        this.screenService = screenService;
    }

    @GetMapping
    public ResponseEntity<List<TheatreResponse>> getAllTheatres(@RequestParam(required = false) String city) {
        return ResponseEntity.ok(theatreService.getAllTheatres(city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheatreResponse> getTheatreById(@PathVariable Long id) {
        return ResponseEntity.ok(theatreService.getTheatreById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheatreResponse> createTheatre(@Valid @RequestBody TheatreRequest request) {
        TheatreResponse response = theatreService.createTheatre(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TheatreResponse> updateTheatre(@PathVariable Long id, @Valid @RequestBody TheatreRequest request) {
        return ResponseEntity.ok(theatreService.updateTheatre(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTheatre(@PathVariable Long id) {
        theatreService.deleteTheatre(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{theatreId}/screens")
    public ResponseEntity<List<ScreenResponse>> getScreensByTheatreId(@PathVariable Long theatreId) {
        return ResponseEntity.ok(screenService.getScreensByTheatreId(theatreId));
    }

    @PostMapping("/{theatreId}/screens")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ScreenResponse> createScreen(@PathVariable Long theatreId, @Valid @RequestBody ScreenRequest request) {
        ScreenResponse response = screenService.createScreen(theatreId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
