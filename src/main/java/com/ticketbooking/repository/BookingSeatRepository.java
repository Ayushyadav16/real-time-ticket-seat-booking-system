package com.ticketbooking.repository;

import com.ticketbooking.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("SELECT bs.seat.id FROM BookingSeat bs " +
           "WHERE bs.booking.show.id = :showId " +
           "AND bs.booking.status IN ('CONFIRMED', 'PENDING')")
    Set<Long> findBookedSeatIdsForShow(@Param("showId") Long showId);

    @Query("SELECT COUNT(bs) > 0 FROM BookingSeat bs " +
           "WHERE bs.booking.show.id = :showId " +
           "AND bs.seat.id = :seatId " +
           "AND bs.booking.status IN ('CONFIRMED', 'PENDING')")
    boolean isSeatBookedForShow(@Param("showId") Long showId, @Param("seatId") Long seatId);
}
