package com.ticketbooking.service;

import com.ticketbooking.dto.SeatLockResponse;
import com.ticketbooking.dto.ShowSeatResponse;
import com.ticketbooking.entity.*;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.BookingSeatRepository;
import com.ticketbooking.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatAvailabilityService {

    private final ShowService showService;
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatLockService seatLockService;

    @Value("${app.seat.lock-ttl-seconds:300}")
    private long lockTtlSeconds;

    // Standard baseline seat tier pricing
    private static final BigDecimal REGULAR_PRICE = new BigDecimal("12.00");
    private static final BigDecimal PREMIUM_PRICE = new BigDecimal("18.00");
    private static final BigDecimal RECLINER_PRICE = new BigDecimal("25.00");

    public SeatAvailabilityService(ShowService showService,
                                   SeatRepository seatRepository,
                                   BookingSeatRepository bookingSeatRepository,
                                   SeatLockService seatLockService) {
        this.showService = showService;
        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.seatLockService = seatLockService;
    }

    public BigDecimal getSeatPrice(SeatType seatType) {
        if (seatType == null) return REGULAR_PRICE;
        return switch (seatType) {
            case PREMIUM -> PREMIUM_PRICE;
            case RECLINER -> RECLINER_PRICE;
            default -> REGULAR_PRICE;
        };
    }

    @Transactional(readOnly = true)
    public List<ShowSeatResponse> getSeatsForShow(Long showId, Long currentUserId) {
        Show show = showService.getShowEntity(showId);
        Long screenId = show.getScreen().getId();

        // 1. Fetch physical seats for the screen
        List<Seat> physicalSeats = seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(screenId);

        // 2. Fetch permanently booked seats for this show from MySQL
        Set<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsForShow(showId);

        // 3. Compute real-time state for each seat
        List<ShowSeatResponse> responses = new ArrayList<>();
        for (Seat seat : physicalSeats) {
            Long seatId = seat.getId();
            BigDecimal price = getSeatPrice(seat.getSeatType());

            if (bookedSeatIds.contains(seatId)) {
                responses.add(new ShowSeatResponse(
                        seatId, seat.getRowLabel(), seat.getSeatNumber(),
                        seat.getSeatType(), SeatStatus.BOOKED, price, false, null
                ));
            } else {
                Long lockOwner = seatLockService.getSeatLockOwner(showId, seatId);
                if (lockOwner != null) {
                    boolean isMyLock = currentUserId != null && currentUserId.equals(lockOwner);
                    Long remainingTtl = seatLockService.getRemainingTtlSeconds(showId, seatId);
                    responses.add(new ShowSeatResponse(
                            seatId, seat.getRowLabel(), seat.getSeatNumber(),
                            seat.getSeatType(), SeatStatus.LOCKED, price, isMyLock, remainingTtl
                    ));
                } else {
                    responses.add(new ShowSeatResponse(
                            seatId, seat.getRowLabel(), seat.getSeatNumber(),
                            seat.getSeatType(), SeatStatus.AVAILABLE, price, false, null
                    ));
                }
            }
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public SeatLockResponse lockSeats(Long showId, List<Long> seatIds, Long userId) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new BadRequestException("At least one seat must be selected to lock");
        }

        Show show = showService.getShowEntity(showId);
        if (show.getStatus() == ShowStatus.CANCELLED) {
            throw new BadRequestException("Cannot lock seats for a cancelled show");
        }

        // Verify that all requested seat IDs physically belong to this show's screen
        List<Seat> screenSeats = seatRepository.findByScreenIdOrderByRowLabelAscSeatNumberAsc(show.getScreen().getId());
        Set<Long> validSeatIds = screenSeats.stream().map(Seat::getId).collect(Collectors.toSet());
        for (Long seatId : seatIds) {
            if (!validSeatIds.contains(seatId)) {
                throw new ResourceNotFoundException("Seat ID " + seatId + " does not belong to this show's screen");
            }
        }

        // Verify none of the seats are permanently booked in MySQL
        Set<Long> bookedSeatIds = bookingSeatRepository.findBookedSeatIdsForShow(showId);
        for (Long seatId : seatIds) {
            if (bookedSeatIds.contains(seatId)) {
                throw new BadRequestException("Seat ID " + seatId + " is already permanently booked for this show");
            }
        }

        // Attempt atomic multi-seat lock in Redis (all-or-nothing rollback)
        boolean lockSuccess = seatLockService.lockSeats(showId, seatIds, userId, lockTtlSeconds);
        if (!lockSuccess) {
            throw new BadRequestException("One or more selected seats are currently locked by another customer. Please select different seats.");
        }

        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(lockTtlSeconds);
        return new SeatLockResponse(
                showId,
                seatIds,
                lockTtlSeconds,
                expiresAt,
                String.format("Successfully locked %d seat(s) for 5 minutes.", seatIds.size())
        );
    }

    public void unlockSeats(Long showId, List<Long> seatIds, Long userId) {
        if (seatIds != null && !seatIds.isEmpty()) {
            seatLockService.unlockSeats(showId, seatIds, userId);
        }
    }
}
