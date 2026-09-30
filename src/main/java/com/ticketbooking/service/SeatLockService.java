package com.ticketbooking.service;

import java.util.List;
import java.util.Map;

public interface SeatLockService {

    /**
     * Atomically locks a seat for a show with a TTL (e.g. 300s).
     * @return true if lock was acquired, false if already locked.
     */
    boolean lockSeat(Long showId, Long seatId, Long userId, long ttlSeconds);

    /**
     * Attempts to atomically lock all requested seats.
     * If ANY seat fails to lock, all previously acquired locks in this batch are rolled back.
     * @return true if all seats were locked, false otherwise.
     */
    boolean lockSeats(Long showId, List<Long> seatIds, Long userId, long ttlSeconds);

    /**
     * Releases lock on a seat if held by the given userId.
     */
    void unlockSeat(Long showId, Long seatId, Long userId);

    /**
     * Releases locks on multiple seats for the given userId.
     */
    void unlockSeats(Long showId, List<Long> seatIds, Long userId);

    /**
     * Returns the userId holding the lock for this seat, or null if unlocked/expired.
     */
    Long getSeatLockOwner(Long showId, Long seatId);

    /**
     * Returns remaining TTL in seconds for a locked seat, or null if not locked.
     */
    Long getRemainingTtlSeconds(Long showId, Long seatId);

    /**
     * Returns map of seatId -> userId for all currently locked seats for a show.
     */
    Map<Long, Long> getLockedSeatsForShow(Long showId, List<Long> seatIds);
}
