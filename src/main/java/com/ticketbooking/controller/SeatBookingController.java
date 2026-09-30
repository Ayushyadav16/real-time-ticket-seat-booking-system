package com.ticketbooking.controller;

import com.ticketbooking.dto.SeatLockRequest;
import com.ticketbooking.dto.SeatLockResponse;
import com.ticketbooking.dto.ShowSeatResponse;
import com.ticketbooking.entity.User;
import com.ticketbooking.repository.UserRepository;
import com.ticketbooking.service.SeatAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shows/{showId}/seats")
public class SeatBookingController {

    private final SeatAvailabilityService seatAvailabilityService;
    private final UserRepository userRepository;

    public SeatBookingController(SeatAvailabilityService seatAvailabilityService,
                                 UserRepository userRepository) {
        this.seatAvailabilityService = seatAvailabilityService;
        this.userRepository = userRepository;
    }

    private Long resolveCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            return userRepository.findByEmail(email).map(User::getId).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<ShowSeatResponse>> getSeats(@PathVariable Long showId) {
        Long currentUserId = resolveCurrentUserId();
        List<ShowSeatResponse> seats = seatAvailabilityService.getSeatsForShow(showId, currentUserId);
        return ResponseEntity.ok(seats);
    }

    @PostMapping("/lock")
    public ResponseEntity<SeatLockResponse> lockSeats(
            @PathVariable Long showId,
            @Valid @RequestBody SeatLockRequest request) {
        Long currentUserId = resolveCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        SeatLockResponse response = seatAvailabilityService.lockSeats(showId, request.getSeatIds(), currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/unlock")
    public ResponseEntity<Map<String, String>> unlockSeats(
            @PathVariable Long showId,
            @Valid @RequestBody SeatLockRequest request) {
        Long currentUserId = resolveCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        seatAvailabilityService.unlockSeats(showId, request.getSeatIds(), currentUserId);
        return ResponseEntity.ok(Map.of("message", "Seats unlocked successfully"));
    }
}
