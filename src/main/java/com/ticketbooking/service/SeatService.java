package com.ticketbooking.service;

import com.ticketbooking.dto.SeatLayoutGenerateRequest;
import com.ticketbooking.dto.SeatResponse;
import com.ticketbooking.entity.Screen;
import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatType;
import com.ticketbooking.repository.ScreenRepository;
import com.ticketbooking.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SeatService {

    private final SeatRepository seatRepository;
    private final ScreenService screenService;
    private final ScreenRepository screenRepository;

    public SeatService(SeatRepository seatRepository, ScreenService screenService, ScreenRepository screenRepository) {
        this.seatRepository = seatRepository;
        this.screenService = screenService;
        this.screenRepository = screenRepository;
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByScreenId(Long screenId) {
        screenService.getScreenEntity(screenId);
        List<Seat> seats = seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(screenId);
        return seats.stream().map(SeatResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public List<SeatResponse> generateSeatsForScreen(Long screenId, SeatLayoutGenerateRequest request) {
        Screen screen = screenService.getScreenEntity(screenId);

        // Remove any existing seats for screen
        seatRepository.deleteByScreenId(screenId);

        Set<String> premiumRows = new HashSet<>();
        if (request.getPremiumRows() != null) {
            request.getPremiumRows().forEach(r -> premiumRows.add(r.trim().toUpperCase()));
        }

        Set<String> reclinerRows = new HashSet<>();
        if (request.getReclinerRows() != null) {
            request.getReclinerRows().forEach(r -> reclinerRows.add(r.trim().toUpperCase()));
        }

        List<Seat> seats = new ArrayList<>();
        for (String row : request.getRows()) {
            String rowTrimmed = row.trim().toUpperCase();
            SeatType type = SeatType.REGULAR;
            if (reclinerRows.contains(rowTrimmed)) {
                type = SeatType.RECLINER;
            } else if (premiumRows.contains(rowTrimmed)) {
                type = SeatType.PREMIUM;
            }

            for (int num = 1; num <= request.getSeatsPerRow(); num++) {
                seats.add(new Seat(screen, rowTrimmed, num, type));
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(seats);

        // Update capacity on screen if needed
        screen.setCapacity(savedSeats.size());
        screenRepository.save(screen);

        return savedSeats.stream().map(SeatResponse::fromEntity).collect(Collectors.toList());
    }
}
