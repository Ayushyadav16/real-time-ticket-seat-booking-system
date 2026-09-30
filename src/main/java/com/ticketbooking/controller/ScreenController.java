package com.ticketbooking.controller;

import com.ticketbooking.dto.SeatLayoutGenerateRequest;
import com.ticketbooking.dto.SeatResponse;
import com.ticketbooking.dto.ScreenResponse;
import com.ticketbooking.service.ScreenService;
import com.ticketbooking.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
public class ScreenController {

    private final ScreenService screenService;
    private final SeatService seatService;

    public ScreenController(ScreenService screenService, SeatService seatService) {
        this.screenService = screenService;
        this.seatService = seatService;
    }

    @GetMapping("/{screenId}")
    public ResponseEntity<ScreenResponse> getScreenById(@PathVariable Long screenId) {
        return ResponseEntity.ok(screenService.getScreenById(screenId));
    }

    @DeleteMapping("/{screenId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteScreen(@PathVariable Long screenId) {
        screenService.deleteScreen(screenId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{screenId}/seats")
    public ResponseEntity<List<SeatResponse>> getSeatsByScreenId(@PathVariable Long screenId) {
        return ResponseEntity.ok(seatService.getSeatsByScreenId(screenId));
    }

    @PostMapping("/{screenId}/seats/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SeatResponse>> generateSeatsForScreen(
            @PathVariable Long screenId,
            @Valid @RequestBody SeatLayoutGenerateRequest request) {
        List<SeatResponse> seats = seatService.generateSeatsForScreen(screenId, request);
        return ResponseEntity.ok(seats);
    }
}
