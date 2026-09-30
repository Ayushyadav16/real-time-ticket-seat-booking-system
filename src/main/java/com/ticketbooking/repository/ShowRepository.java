package com.ticketbooking.repository;

import com.ticketbooking.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    @Query("SELECT s FROM Show s " +
           "WHERE s.screen.id = :screenId " +
           "AND s.status != com.ticketbooking.entity.ShowStatus.CANCELLED " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Show> findOverlappingShows(
            @Param("screenId") Long screenId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT s FROM Show s " +
           "WHERE s.screen.id = :screenId " +
           "AND s.id != :excludeShowId " +
           "AND s.status != com.ticketbooking.entity.ShowStatus.CANCELLED " +
           "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Show> findOverlappingShowsExcluding(
            @Param("screenId") Long screenId,
            @Param("excludeShowId") Long excludeShowId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT s FROM Show s " +
           "JOIN FETCH s.movie m " +
           "JOIN FETCH s.screen sc " +
           "JOIN FETCH sc.theatre t " +
           "WHERE (:movieId IS NULL OR m.id = :movieId) " +
           "AND (:theatreId IS NULL OR t.id = :theatreId) " +
           "AND (:startTime IS NULL OR s.startTime >= :startTime) " +
           "AND (:endTime IS NULL OR s.startTime <= :endTime) " +
           "ORDER BY s.startTime ASC")
    List<Show> findFilteredShows(
            @Param("movieId") Long movieId,
            @Param("theatreId") Long theatreId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<Show> findByMovieId(Long movieId);

    List<Show> findByScreenId(Long screenId);
}
