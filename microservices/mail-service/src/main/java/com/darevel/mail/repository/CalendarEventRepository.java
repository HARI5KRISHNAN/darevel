package com.darevel.mail.repository;

import com.darevel.mail.entity.CalendarEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    Optional<CalendarEvent> findByIdAndUserId(Long id, String userId);

    Page<CalendarEvent> findByUserIdAndIsCancelledFalseOrderByStartTimeAsc(String userId, Pageable pageable);

    @Query("SELECT e FROM CalendarEvent e WHERE e.userId = :userId " +
           "AND e.isCancelled = false " +
           "AND e.startTime >= :startDate " +
           "AND e.endTime <= :endDate " +
           "ORDER BY e.startTime ASC")
    List<CalendarEvent> findEventsByDateRange(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT e FROM CalendarEvent e WHERE e.userId = :userId " +
           "AND e.isCancelled = false " +
           "AND e.startTime <= :now " +
           "AND e.endTime >= :now")
    List<CalendarEvent> findCurrentEvents(
        @Param("userId") String userId,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT e FROM CalendarEvent e WHERE e.userId = :userId " +
           "AND e.isCancelled = false " +
           "AND (LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CalendarEvent> searchEvents(
        @Param("userId") String userId,
        @Param("query") String query,
        Pageable pageable
    );
}
